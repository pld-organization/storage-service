import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { MulterError } from 'multer';

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let message = 'Erreur de téléchargement de fichier';
    let status = 400;

    switch (exception.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'Le fichier dépasse la taille maximale de 5MB';
        status = 413;
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Nombre de fichiers maximum dépassé';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Champ de fichier inattendu';
        break;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.code,
    });
  }
}