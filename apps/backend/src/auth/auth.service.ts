import { Inject, Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/User';
import { JwtService } from '@nestjs/jwt';
import type { UserPayload } from '@repo/shared-types';
import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    @Inject('GoogleOAuthClient') private googleOAuthClient: OAuth2Client,
    private configService: ConfigService,
  ) {}

  getAuthCookieOptions() {
    return {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax' as const,
    };
  }

  async googleAuth(token: string): Promise<{ jwtToken: string }> {
    const ticket = await this.googleOAuthClient.verifyIdToken({
      idToken: token,
      audience: this.configService.get<string>('GOOGLE_OAUTH_CLIENT_ID'),
    });

    const { email, picture, given_name, family_name } =
      ticket.getPayload() || {};

    let user = await this.userModel.findOne({ email });

    if (!user) {
      user = new this.userModel({
        _id: crypto.randomUUID(),
        firstName: given_name || 'GoogleUser',
        lastName: family_name || 'GoogleUser',
        email,
        profilePicture: picture,
      });
      await user.save();
    }

    const jwtToken = this.jwtService.sign({
      _id: user._id,
    });

    return { jwtToken };
  }

  getCurrentUser(user: UserPayload): UserPayload {
    return user;
  }
}
