import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, type RequestUser } from './decorators/current-user.decorator';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';
import { ForgotPasswordResetDto } from './dto/forgot-password-reset.dto';
import { ForgotPasswordVerifyDto } from './dto/forgot-password-verify.dto';
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

  @Post('forgot-password/request-otp')
  @ApiOperation({ summary: 'Request OTP to reset password via SMS' })
  forgotPasswordRequestOtp(@Body() dto: ForgotPasswordRequestDto) {
    return this.auth.requestPasswordResetOtp(dto.phone);
  }

  @Post('forgot-password/verify-otp')
  @ApiOperation({ summary: 'Verify OTP and receive reset token' })
  forgotPasswordVerifyOtp(@Body() dto: ForgotPasswordVerifyDto) {
    return this.auth.verifyPasswordResetOtp(dto.phone, dto.otp);
  }

  @Post('forgot-password/reset')
  @ApiOperation({ summary: 'Reset password using verified reset token' })
  forgotPasswordReset(@Body() dto: ForgotPasswordResetDto) {
    return this.auth.resetPasswordWithOtp(dto.phone, dto.resetToken, dto.newPassword);
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

  @Get('superadmin/dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Super admin overview summary' })
  superAdminDashboard(@CurrentUser() user: RequestUser) {
    return this.auth.superAdminDashboard(user);
  }
}


