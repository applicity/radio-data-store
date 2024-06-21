import makeDirectory from "../../domain/cisco";

const resolvers = {
  Query: {
    getPhoneNumberList: async (parent, args, context) =>
    {
      return context.db.allNumbers();
      return [{number_id:1, name: 'sam', number: 123}]
    },

    getRadios: async (parent, args, context) => {
      return context.db.allRadios();
    },
    getRadioCount: async (parent, args, context) => {
      return context.db.getRadioCount();
    },

    getLatestReport: async (parent, args, context) => {
      return context.db.getLatestReport()
    },
    
    getRadioTimes: async (parent, args, context) => {
      console.log(args);
      return context.db.getRadioTimes(args.params);
    },
    getRadioDataForPeriod: async (parent, args, context) => {
      return context.db.getRadioDataForPeriod(args.params);
    }

  },
  Mutation: {
    addPhoneNumber: async (parent, args, context) => {
      // console.log(JSON.parse(JSON.stringify(args)), context)
      // console.log('mutation called', args);
      const { phoneNumber } = args;

      return context.db.addPhoneNumber(phoneNumber.name, phoneNumber.number)
      return {number_id: 99, name: 'mutation test', number: 132 }
    },
    deletePhoneNumber: async (parent, args, context) => {
      // console.log(JSON.parse(JSON.stringify(args)), context)
      const { number_id } = args;
      return context.db.deletePhoneNumber(number_id);

      return { id: 1 }
    },
    addRadioReport: async (parent, args, context) => {
      const { report } = args;
      const { name, radio_type, ip, volume, status, state, uri } = report;
      //name, radioType, ip, volume, status, state
      return context.db.addRadioReport(name, radio_type, ip, volume, status, state, uri);
    },
    generatePhoneBookXML: async (parent, args, context) => {
      const numbers = await context.db.allNumbers();

      const xml = makeDirectory(numbers);
      return xml;
      return 'Example data';

    }
  },
};
export default resolvers;