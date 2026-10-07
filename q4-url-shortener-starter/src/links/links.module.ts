import { Module } from "@nestjs/common";
import { APP_CONFIG, CLOCK, SLUG_GENERATOR } from "./links.constants";
import { LinksController, RedirectController } from "./links.controller";
import { LinksService } from "./links.service";
import { RandomSlugGenerator } from "./random-slug.generator";
import { SystemClock } from "./system.clock";

@Module({
  controllers: [LinksController, RedirectController],
  providers: [
    LinksService,
    { provide: SLUG_GENERATOR, useClass: RandomSlugGenerator },
    { provide: CLOCK, useClass: SystemClock },
    {
      provide: APP_CONFIG,
      useFactory: () => ({
        baseUrl: process.env.BASE_URL ?? "http://localhost:3000",
      }),
    },
  ],
})
export class LinksModule {}
