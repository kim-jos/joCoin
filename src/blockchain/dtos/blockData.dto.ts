import { IsString } from "class-validator";


export class BlockDataDto {
    @IsString()
    data: string;
}