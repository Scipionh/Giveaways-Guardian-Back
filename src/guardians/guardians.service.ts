import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Guardian, GuardianDocument } from "./schemas/guardian.schema";
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { ActualGuardian, ActualGuardianDocument } from "./schemas/actual-guardian.schema";
import { CreateActualGuardianDto } from './dto/create-actual-guardian.dto';
import { Participant } from '../models/participant';
import { UsersService } from '../users/users.service';
import { ChatClientService } from '../service/chat-client.service';
import { TEXTS } from "../config/texts";
import { User } from "../users/schemas/user.schema";

@Injectable()
export class GuardiansService {
  private chatClient;

  constructor(
    @InjectModel(Guardian.name) private readonly guardianModel: Model<GuardianDocument>,
    @InjectModel(ActualGuardian.name) private readonly actualGuardianModel: Model<ActualGuardianDocument>,
    private readonly usersService: UsersService,
    private readonly chatClientService: ChatClientService,
  ) {
    this.chatClient = this.chatClientService.chatClient;
  }

  guardian: ActualGuardian;

  async create(createGuardianDto: CreateGuardianDto): Promise<Guardian> {
    const createdGuardian = new this.guardianModel(createGuardianDto);
    return createdGuardian.save();
  }

  instantiate(health: number, name: string): void {
    this.hasGuardianInProgress().then(inProgress => {
      if(!inProgress) {
        const guardian = new Guardian(health, name);
        this.guardian = new ActualGuardian(guardian, false, false);
        this.create(guardian.toCreateGuardianDto())
          .then(guardian => this.createActualGuardian(guardian))
          .then(actualGuardian => this.chatClient.say(
            this.chatClientService.channel,
            TEXTS.newGuardian.found + " " +
            TEXTS.newGuardian.name + " " +
            actualGuardian.name + " " +
            TEXTS.newGuardian.andHas + " " +
            actualGuardian.health + " " +
            TEXTS.newGuardian.healthPoints));
      } else {
        this.chatClient.say(this.chatClientService.channel, TEXTS.alreadyFighthting);
      }
    });
  }

  kick(userId: string, numberOfHitPoints: number): Promise<User> {
    return this.isDead()
      .then(isDead => !isDead ? this.usersService.canHitGuardian(userId, numberOfHitPoints) : false)
      .then(canHit => {
        if(canHit) {
          let damageDealt = 0;
          for (let i = 0; i < numberOfHitPoints; i++) {
            damageDealt += Math.floor(Math.random() * 6) + 1;
          }

          return this.removeHealth(damageDealt, numberOfHitPoints)
            .then(() => this.getCurrentId())
            .then((currentGuardianId: string) => {
              this.usersService.addParticipation(userId, currentGuardianId);
              return currentGuardianId;
            })
            .then((currentGuardianId: string) => this.addParticipant(userId, damageDealt, currentGuardianId, numberOfHitPoints))
            .then(() => this.usersService.removeHitpoints(userId, numberOfHitPoints))
            .then((user: User) => user);
        } else {
          this.chatClient.say(this.chatClientService.channel, "YOU CAN'T DO THAT SORRY");
        }
      })
  }

  getParticipants(): Promise<Participant[]> {
    return this.getCurrentId()
      .then(currentGuardianId => this.getById(currentGuardianId))
      .then(guardian => guardian.participants);
  }

  async giveaway(): Promise<Participant> {
    const isDead = await this.isDead();
    if(isDead) {
      return this.redeemGuardian()
        .then(() => this.getParticipants())
        .then(participants => participants[Math.floor(Math.random() * participants.length)]);
    }
  }

  createActualGuardian(createGuardianDto: Guardian): Promise<ActualGuardian> {
    const actualGuardian: CreateActualGuardianDto = {
      actualGuardianId: createGuardianDto.id,
      name: createGuardianDto.name,
      health: createGuardianDto.health,
      currentHealth: createGuardianDto.health,
      numberOfHits: 0,
      isDead: false,
      isRedeemed: false
    }
    const createdActualGuardian = new this.actualGuardianModel(actualGuardian);
    return createdActualGuardian.save();
  }

  async removeHealth(damageDealt: number, numberOfHitPoints: number): Promise<ActualGuardian> {
    return await this.actualGuardianModel.findOne().exec().then(actualGuardian => {
      const isDead = actualGuardian.health <= 0;
      const payload = isDead
        ? {currentHealth: (actualGuardian.currentHealth - damageDealt), numberOfHits: actualGuardian.numberOfHits + numberOfHitPoints, isDead: true}
        : {currentHealth: (actualGuardian.currentHealth - damageDealt), numberOfHits: actualGuardian.numberOfHits + numberOfHitPoints}
      actualGuardian.updateOne(payload).exec();
      return actualGuardian.save();
    });
  }

  async redeemGuardian(): Promise<ActualGuardian> {
    return await this.actualGuardianModel.findOne().exec().then(actualGuardian => {
      actualGuardian.updateOne({isRedeemed: true}).exec();
      return actualGuardian.save();
    });
  }

  async addParticipant(userId: string, damageDealt: number, guardianId: string, numberOfHitPoints: number): Promise<GuardianDocument> {
    return this.getById(guardianId).then(guardian => {
        if(!guardian.participants.some(el => el.userId === userId)) {
          this.usersService.getById(userId).then(u => {
            const participant: Participant = {userId: userId, username: u.displayName, damageDealt: damageDealt, numberOfHits: numberOfHitPoints};
            guardian.updateOne({ $push: {participants: participant}}).exec();
            return guardian.save();
          })
        } else {
          guardian.collection.findOne({"participants.userId": userId}).then(x => {
            const value = x.participants.find(y => y.userId = userId)
            guardian.collection.updateOne({"participants.userId": userId},
              {$set: {"participants.$.damageDealt": value.damageDealt + damageDealt, "participants.$.numberOfHits": value.numberOfHits + numberOfHitPoints}})
          })
          return guardian.save();
        }
    });
  }

  async resumeGuardian(): Promise<void> {
    if(await this.hasGuardianInProgress()) {
      this.guardian = await this.getActualGuardian();
    }
  }

  hasGuardianInProgress(): Promise<boolean> {
    return this.getActualGuardian().then(actualGuardian => !!actualGuardian ? (!actualGuardian.isDead && !actualGuardian.isRedeemed) : false);
  }

  async getById(guardianId: string): Promise<GuardianDocument> {
    return this.guardianModel.findById(guardianId).exec();
  }

  async getCurrentId(): Promise<string> {
    return this.getActualGuardian().then(x => x.actualGuardianId);
  }

  async getActualGuardian(): Promise<ActualGuardian> {
    return this.actualGuardianModel.findOne().exec();
  }

  public isDead(): Promise<boolean> {
    return this.getActualGuardian().then(actualGuardian => !!actualGuardian ? actualGuardian.isDead : true);
  }
}
