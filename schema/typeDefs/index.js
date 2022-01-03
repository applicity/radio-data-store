import { gql } from "apollo-server-express";
const typeDefs = gql`
  type PhoneNumber {
    number_id: ID,
    name: String!
    number: String!
    createdAt: String
 }

 type RadioDetails {
   name: String!
   location: String
   created: String
   last_ip: String
   last_reported: String
 }

 type Result {
   id: ID
 }

 input RadioReportInput {
   name: String!
   ip: String
   volume: Int
   status: String
 }

 input PhoneNumberInput {
    name: String!
    number: String!
  }

  type Query {
    getPhoneNumberList: [PhoneNumber]
    getRadios: [RadioDetails]
  }

  type Mutation {
    addPhoneNumber(phoneNumber: PhoneNumberInput): PhoneNumber
    deletePhoneNumber(number_id: ID): Result
    addRadioReport(report: RadioReportInput): RadioDetails
    generatePhoneBookXML: String
  }`;
export default typeDefs;
