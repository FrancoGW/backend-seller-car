import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from './user.schema';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<{ id: string; email: string; name?: string; role: string } | null> {
    const user = await this.userModel.findOne({ email }).lean();
    if (!user?.passwordHash) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    return {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');
    if (user.role !== 'admin') throw new UnauthorizedException('Acceso solo para administradores');
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('email name role image').lean();
    if (!user) return null;
    return { id: String(user._id), email: user.email, name: user.name, role: user.role, image: user.image };
  }
}
