import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from "./schemas/user.schema";
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpService, Injectable } from "@nestjs/common";
import * as fs from "fs";
import { clientId } from "../auth-config";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>, private httpService: HttpService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async addHitpoints(userId: string, numberOfHitpoints: number): Promise<User> {
    return this.getById(userId).then(user => {
      return user.updateOne({hitPoints: user.hitPoints + numberOfHitpoints}).exec().then(() => {
        return this.getById(userId);
      });
    })
  }

  async removeHitpoints(userId: string, numberOfHitpoints: number): Promise<User> {
    return this.getById(userId).then(u => {
      return u.updateOne({hitPoints: u.hitPoints - numberOfHitpoints}).exec().then(() => {
        return this.getById(userId);
      });
    })
  }

  getById(userId: string): Promise<UserDocument> {
    return this.userModel.findOne({id: userId}).exec();
  }

  loadProfile(extensionData: any): Promise<User> {
    return this.getById(extensionData['user_id'])
      .then(user => this.getUserInfoFromTwitch(user, extensionData['user_id']))
  }

  async getUserInfoFromTwitch(user: User, userId: string): Promise<User> {
    if (user) {
      return user;
    }
    const tokenData = JSON.parse(fs.readFileSync('./src/config/tokens.json', 'UTF-8'));
    return this.httpService.get('https://api.twitch.tv/helix/users?id=' + userId, {headers: {'client-id': clientId, 'authorization': 'Bearer ' + tokenData.accessToken}})
      .toPromise().then(twitchUser => this.create(new User(twitchUser.data.data[0]).toCreateUserDto()));
  }

  async addParticipation(userId: string, guardianId: string) {
    this.getFoughtGuardiansList(userId).then(foughtGuardiansList => {
      if(foughtGuardiansList.indexOf(guardianId) == -1) {
        this.updateFoughtGuardians(userId, guardianId);
      }
    })
  }

  private async getFoughtGuardiansList(userId: string): Promise<string[]> {
    return await this.getById(userId).then(user => user.get('foughtGuardians'));
  }

  private async updateFoughtGuardians(userId: string, guardianId: string) {
    this.getById(userId).then(user => user.updateOne({$push: {foughtGuardians: guardianId}}).exec());
  }

  canHitGuardian(userId: string, numberOfHitPoints: number): Promise<boolean> {
    return this.getById(userId).then(user => user.hitPoints >= numberOfHitPoints);
  }
}
