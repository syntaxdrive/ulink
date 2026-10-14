import { Controller, Post, Put, Body, Param, Request, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UploadService } from './upload.service';

class PresignDto {
  folder!: string;
  ext!: string;
  mimeType?: string;
}

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiOperation({ summary: 'Get a presigned upload URL or Azure fallback' })
  @Post('presign')
  @HttpCode(HttpStatus.OK)
  presign(
    @Request() req: any,
    @Body() body: PresignDto,
  ) {
    return this.uploadService.presign(
      body.folder || 'posts',
      body.ext || 'jpg',
      body.mimeType,
    );
  }

  @ApiOperation({ summary: 'Stream binary media directly to Azure VM storage disk' })
  @Put('file/:folder/:filename')
  @HttpCode(HttpStatus.OK)
  async uploadBinary(
    @Req() req: any,
    @Param('folder') folder: string,
    @Param('filename') filename: string,
  ) {
    return this.uploadService.saveBinaryFile(req, folder, filename);
  }
}
