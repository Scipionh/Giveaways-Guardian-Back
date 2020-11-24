import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { GuardianS } from './schemas/guardian.schema';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { ActualGuardianS } from './schemas/actual-guardian.schema';
import { Guardian } from './guardians.model';
import { CreateActualGuardianDto } from './dto/create-actual-guardian.dto';
import { User } from '../users/users.model';
import { ActualGuardian } from './actual-guardian.model';
import { Participant } from '../models/participant';

@Injectable()
export class GuardiansService {
  constructor(
    @InjectModel(GuardianS.name) private readonly guardianModel: Model<GuardianS>,
    @InjectModel(ActualGuardianS.name) private readonly actualGuardianModel: Model<ActualGuardianS>
  ) {}

  guardian: ActualGuardian;

  async create(createGuardianDto: CreateGuardianDto): Promise<GuardianS> {
    const createdGuardian = new this.guardianModel(createGuardianDto);
    return createdGuardian.save();
  }

  async createActualGuardian(createGuardianDto: GuardianS): Promise<ActualGuardianS> {
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

  async removeHealth(damageDealt: number): Promise<ActualGuardianS> {
    return await this.actualGuardianModel.findOne().exec().then(x => {
      console.log('GUCCI_removeHealth', x);
      x.updateOne({currentHealth: (x.currentHealth - damageDealt), numberOfHits: x.numberOfHits++}).exec();
      return x.save();
    });
  }

  async addParticipant(user: User, damageDealt: number, guardianId: string) {
    return this.getById(guardianId).then(guardian => {
        if(!guardian.participants.some(el => el.userId === user.id)) {
          const participant: Participant = {userId: user.id, username: user.displayName, damageDealt: damageDealt, numberOfHits: 1};
          guardian.updateOne({ $push: {participants: participant}}).exec();
          return guardian.save();
        } else {
          guardian.collection.findOne({"participants.userId": user.id}).then(x => {
            const value = x.participants.find(y => y.userId = user.id)
            guardian.collection.updateOne({"participants.userId": user.id},
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

  async findAll(): Promise<GuardianS[]> {
    return this.guardianModel.find().exec();
  }

  async getById(guardianId: string): Promise<GuardianS> {
    return this.guardianModel.findById(guardianId).exec();
  }

  async getCurrentId(): Promise<string> {
    return this.getActualGuardian().then(x => x.actualGuardianId);
  }

  private async getActualGuardian(): Promise<ActualGuardianS>{
    return this.actualGuardianModel.findOne().exec();
  }

  public isDead(): Promise<boolean> {
    return this.getActualGuardian().then(x => {
      return !!x ? x.isDead : true
    });
  }
}
