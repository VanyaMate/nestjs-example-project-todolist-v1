import { Body, Controller, Get, HttpCode, Post, Res, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../../user/dto/create-user.dto";
import { ClassValidatorPipe } from "../../../pipes/class-validator.pipe";
import { COOKIE_ACCESS_TOKEN } from "../../../constants/cookies.constant";
import { Response } from 'express';
import { getMsDays } from "../../../helpers/utils.helper";
import { AccessTokenGuard } from "../../../guards/access-token.guard";
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
    LogoutSwagger,
    ResponseUnauthorizedSwagger,
    SWAGGER_JWT_EXAMPLE,
    UserSwagger
} from "../../../configs/swagger.config";
import { IUserVerifiedData, UserVerified } from "../../../decorators/user-verified.decorator";

@ApiTags('Аутентификация')
@Controller('/api/auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @ApiOperation({ summary: 'Авторизация по логину и паролю' })
    @ApiResponse({ status: 200, type: UserSwagger })
    @ApiResponse({ status: 401, type: ResponseUnauthorizedSwagger })
    @Post('/login')
    @HttpCode(200)
    @UsePipes(ClassValidatorPipe)
    async login (@Body() createUserDto: CreateUserDto,
                 @Res({ passthrough: true }) res: Response) {
        const { user, jwtToken } = await this.authService.login(createUserDto);
        res.cookie(COOKIE_ACCESS_TOKEN, jwtToken, {
            httpOnly: true,
            maxAge: getMsDays(30)
        })
        return user;
    }

    @ApiOperation({ summary: 'Регистрация по логину и паролю' })
    @ApiResponse({ status: 200, type: UserSwagger })
    @Post('/registration')
    @UsePipes(ClassValidatorPipe)
    async registration (@Body() createUserDto: CreateUserDto,
                        @Res({ passthrough: true }) res: Response) {
        const { user, jwtToken } = await this.authService.registration(createUserDto);
        res.cookie(COOKIE_ACCESS_TOKEN, jwtToken, {
            httpOnly: true,
            maxAge: getMsDays(30)
        })

        return user;
    }

    @ApiOperation({ summary: 'Выход' })
    @ApiResponse({ status: 200, type: LogoutSwagger })
    @ApiResponse({ status: 401, type: ResponseUnauthorizedSwagger })
    @ApiHeader({ name: COOKIE_ACCESS_TOKEN, description: 'Cookie.httpOnly jwt token', example: SWAGGER_JWT_EXAMPLE })
    @Get('/logout')
    @UseGuards(AccessTokenGuard)
    logout (@Res({ passthrough: true }) res: Response) {
        res.clearCookie(COOKIE_ACCESS_TOKEN);
        return { logout: true };
    }

    @Get('/refresh')
    @UseGuards(AccessTokenGuard)
    async refresh (@Res({ passthrough: true }) res: Response,
                   @UserVerified() user: IUserVerifiedData) {
        return await this.authService.refresh(user.id);
    }


}