import { IsNotEmpty, IsOptional } from "class-validator";

export class UpdateQueueEntryStatusDto {
    @IsNotEmpty()
    readonly partySize: number;

    @IsOptional()
    readonly notes : string;
}
