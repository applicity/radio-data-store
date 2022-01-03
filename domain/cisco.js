import { create } from 'xmlbuilder2';
import fs from 'fs';


const makeDirectory = (numbers) => {

  const root = create().ele('CiscoIPPhoneDirectory');
  root.ele('Title').txt('Contacts');
  root.ele('Prompt').txt('Who ya gonna call?');

  numbers.forEach(number => {
    const de = root.ele('DirectoryEntry');
    de.ele('Name').txt(number.name);
    de.ele('Telephone').txt(number.number);
  });

  const serializedXML = root.end({ format: 'xml', prettyPrint: true });

  fs.writeFileSync('/tmp/phone_book.xml', serializedXML);

  return serializedXML;

}


export default makeDirectory;