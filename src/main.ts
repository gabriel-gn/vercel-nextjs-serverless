import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { RedocModule, RedocOptions } from "nestjs-redoc";
import { LanguageInterceptor } from "./shared/interceptors/language.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalInterceptors(new LanguageInterceptor());

  if (process.env.VERCEL_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Legends of Runeterra Decks')
      .setDescription('Get Decks from mobalytics, Runeterra AR and card information for Legends of Runeterra card game.')
      .setVersion('')
      .addTag('Factions', '<SchemaDefinition schemaRef=\"#/components/schemas/Factions\" />')
      .addTag('SearchDeckLibraryDto', '<SchemaDefinition schemaRef=\"#/components/schemas/SearchDeckLibraryDto\" />')
      // .addTag('cats')
      .build()
    ;
    const swaggerOptions: SwaggerDocumentOptions =  {
      operationIdFactory: (
        controllerKey: string,
        methodKey: string
      ) => methodKey
    };
    const document = SwaggerModule.createDocument(app, swaggerConfig, swaggerOptions);

    const redocOptions: RedocOptions = {
      title: 'Legends of Runeterra Decks API Documentation',
      favicon: 'https://lor.cardsrealm.com/ezoimgfmt/cdn.cardsrealm.com/images/icon/lor.png?width=45&ezimgfmt=rs:0x0/rscb1/ng:webp/ngcb1',
      logo: {
        url: 'https://upload.wikimedia.org/wikipedia/it/thumb/1/17/Logo-No_Tag_No-Faction-ENG-RGB.png/260px-Logo-No_Tag_No-Faction-ENG-RGB.png',
        // backgroundColor: '#F0F0F0',
        altText: 'Runeterra Logo'
      },
      requiredPropsFirst: true,
      sortPropsAlphabetically: true,
      hideDownloadButton: true,
      hideHostname: true,
      auth: {
        enabled: false,
        user: 'admin',
        password: '123'
      },
      tagGroups: [
        {
          name: 'General',
          tags: ['Decks'],
        },
        {
          name: 'Models',
          tags: [
            'Factions',
            'SearchDeckLibraryDto'
          ],
        },
      ],
    };

    // Instead of using SwaggerModule.setup() you call this module
    await RedocModule.setup('/docs', app, document, redocOptions);
    // SwaggerModule.setup('docs', app, document);
  }

  await app.listen(3000);
}

bootstrap();
