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

@Injectable()
export class GuardiansService {
  private chatClient;

  constructor(
    @InjectModel(Guardian.name) private readonly guardianModel: Model<GuardianDocument>,
    @InjectModel(ActualGuardian.name) private readonly actualGuardianModel: Model<ActualGuardianDocument>,
    private readonly usersService: UsersService,
    private readonly chatClientService: ChatClientService
  ) {
    this.chatClient = this.chatClientService.chatClient;
  }

  guardian: ActualGuardian;

  async create(createGuardianDto: CreateGuardianDto): Promise<Guardian> {
    const createdGuardian = new this.guardianModel(createGuardianDto);
    return createdGuardian.save();
  }

  kick(userId: string): void {
    this.usersService.canUseCommand(userId, 'kick', 5).then(y => {
      console.log('GUCCI_canUseCommand', y);
      if(y) {
        this.isDead().then(w => {
          console.log('GUCCI_isDead', w);
          if(!w) {
            const damageDealt = Math.floor(Math.random() * 6) + 1;
            this.removeHealth(damageDealt).then(x => {
              this.usersService.updateLastUsage(userId, 'kick').then(() => {
                this.getCurrentId().then(g => {
                  this.usersService.addParticipation(userId, g);
                  this.addParticipant(userId, damageDealt, g);
                })
              })
            })
          }
        })
      } else {
        this.usersService.getRemainingTime(userId, 'kick').then(h => {
          console.log("GUCCI");
          this.chatClient.say(this.chatClientService.channel, `Tu dois encore attendre ${h} avant de pouvoir frapper le gardien à nouveau !!`)
        })
      }
    })
  }

  async createActualGuardian(createGuardianDto: Guardian): Promise<ActualGuardian> {
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

  async removeHealth(damageDealt: number): Promise<ActualGuardian> {
    return await this.actualGuardianModel.findOne().exec().then(x => {
      console.log('GUCCI_removeHealth', x);
      x.updateOne({currentHealth: (x.currentHealth - damageDealt), numberOfHits: x.numberOfHits++}).exec();
      return x.save();
    });
  }

  async addParticipant(userId: string, damageDealt: number, guardianId: string) {
    return this.getById(guardianId).then(guardian => {
        if(!guardian.participants.some(el => el.userId === userId)) {
          this.usersService.getById(userId).then(u => {
            const participant: Participant = {userId: userId, username: u.displayName, damageDealt: damageDealt, numberOfHits: 1};
            guardian.updateOne({ $push: {participants: participant}}).exec();
            return guardian.save();
          })
        } else {
          guardian.collection.findOne({"participants.userId": userId}).then(x => {
            const value = x.participants.find(y => y.userId = userId)
            guardian.collection.updateOne({"participants.userId": userId},
              {$set: {"participants.$.damageDealt": value.damageDealt + damageDealt, "participants.$.numberOfHits": value.numberOfHits + 1}})
          })
          return guardian.save();
        }
    });
  }

  async resumeGuardian() {
    this.hasGuardianInProgress().then(inProgress => {
      if(inProgress) {
        this.getActualGuardian().then(y => {
          this.getById(y.actualGuardianId).then(v => {
            this.guardian = new ActualGuardian(new Guardian(v.health, v.name, v.participants), y.isDead, y.isRedeemed)
          })
        });
      }
    })
  }

  hasGuardianInProgress(): Promise<boolean> {
    return this.getActualGuardian().then(x => {
      return !!x ? (!x.isDead && !x.isRedeemed) : false
    })
  }

  async findAll(): Promise<Guardian[]> {
    return this.guardianModel.find().exec();
  }

  async getById(guardianId: string): Promise<GuardianDocument> {
    return this.guardianModel.findById(guardianId).exec();
  }

  async getCurrentId(): Promise<string> {
    return this.getActualGuardian().then(x => x.actualGuardianId);
  }

  private async getActualGuardian(): Promise<ActualGuardian>{
    return this.actualGuardianModel.findOne().exec();
  }

  public isDead(): Promise<boolean> {
    return this.getActualGuardian().then(x => {
      return !!x ? x.isDead : true
    });
  }
}
