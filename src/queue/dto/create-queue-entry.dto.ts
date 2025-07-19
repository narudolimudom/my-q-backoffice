import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateQueueEntryDto {
    @IsNotEmpty()
    readonly partySize: number;

    @IsOptional()
    readonly notes : string;
}
