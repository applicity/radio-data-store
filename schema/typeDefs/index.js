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
   radio_type: String
 }

 type ReportDetail {
   date: String
   datetime: String
   radio: String
   volume: Int
   status: String
   state: String
   reported: Int
 }

 type Result {
   id: ID
 }

 type RadioCount {
   count: Int
 }

 type RadioTimeResult {
   year: Int
   month: Int
   day: Int
   count: Int
 }

 input RadioReportInput {
   name: String!
   radio_type: String
   ip: String
   volume: Int
   status: String
   state: String
   uri: String
 }

 input timeQueryProperties {
   type: String!
   start: String
   year: String
   month: String
   day: String
 }
 input PhoneNumberInput {
    name: String!
    number: String!
  }

  input dataPeriodProperties {
    periodName: String!
    playing: Boolean
    groupBy: String
  }

  type datePeriodResult {
    display: String
    count: Int
  }

  type Query {
    getPhoneNumberList: [PhoneNumber]
    getRadios: [RadioDetails]
    getRadioCount: RadioCount
    getRadioTimes(params: timeQueryProperties): [RadioTimeResult]
    getRadioDataForPeriod(params: dataPeriodProperties): [datePeriodResult]
    getLatestReport: ReportDetail
  }




  type Mutation {
    addPhoneNumber(phoneNumber: PhoneNumberInput): PhoneNumber
    deletePhoneNumber(number_id: ID): Result
    addRadioReport(report: RadioReportInput): RadioDetails
    generatePhoneBookXML: String
  }`;
export default typeDefs;
