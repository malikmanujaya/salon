import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, type RequestUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Create salon + owner account' })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Sign in' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Issue a new access token' })
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current user profile' })
  me(@CurrentUser() user: RequestUser) {
    return this.auth.me(user);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user details' })
  updateMe(@CurrentUser() user: RequestUser, @Body() dto: UpdateMeDto) {
    return this.auth.updateMe(user, dto);
  }
}
