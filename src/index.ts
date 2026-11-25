import { tampilBanner, jalankanMenu } from './menuutama';

async function main(): Promise<void> {
    tampilBanner();
    await jalankanMenu();
    process.exit(0);
}

main();