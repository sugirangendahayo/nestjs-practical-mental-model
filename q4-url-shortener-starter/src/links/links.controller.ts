import { Body, Controller, Get, Param, Post, Redirect } from "@nestjs/common";
import { CreateLinkDto } from "./dto/create-link.dto";
import { LinksService } from "./links.service";
import { SlugPipe } from "./slug.pipe";

@Controller("links")
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post()
  create(@Body() dto: CreateLinkDto) {
    return this.linksService.create(dto);
  }

  @Get(":slug/stats")
  stats(@Param("slug", new SlugPipe()) slug: string) {
    return this.linksService.stats(slug);
  }
}

@Controller()
export class RedirectController {
  constructor(private readonly linksService: LinksService) {}

  @Get(":slug")
  @Redirect()
  redirect(@Param("slug", new SlugPipe()) slug: string) {
    return this.linksService.redirect(slug);
  }
}
