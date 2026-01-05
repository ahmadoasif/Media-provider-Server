import { Document, Types } from "mongoose";

// Event Types
export const EventType = {
  EMAIL_VERIFIED: "EMAIL_VERIFIED",
  PASSWORD_RESET: "PASSWORD_RESET",
  ACCOUNT_CREATED: "ACCOUNT_CREATED",
  ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
};

export interface IMessage {
  sender: "user" | "vendor";
  text: string;
  seen?: boolean;
  createdAt?: Date;
}

export interface ILastMessage {
  text?: string;
  sender: "user" | "vendor";
  createdAt?: Date;
}
// Chat
export interface IChat {
  userId: Types.ObjectId;
  vendorId: Types.ObjectId;
  propertyId: Types.ObjectId;
  bookingId: Types.ObjectId;
  lastMessage?: ILastMessage;
  messages: IMessage[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Question
export interface IQuestion {
  _id?: Types.ObjectId;
  questionId: string;
  userId: Types.ObjectId;
  vendorId: Types.ObjectId;
  propertyId: Types.ObjectId;
  bookingId: Types.ObjectId;
  question: string;
  answer?: string | null;
  status?: "pending" | "approved" | "rejected";
  answeredAt?: Date | null;
  approvedAt?: Date | null;
  approvedBy?: Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Wishlist
export interface IWishlist {
  userId: Types.ObjectId;
  properties: {
    propertyId: Types.ObjectId;
    addedAt: Date;
  }[];
}

// Review
export interface IRating {
  staff: number;
  facilities: number;
  cleanliness: number;
  comfort: number;
  valueForMoney: number;
  location: number;
  overall: number;
}

export interface IReview {
  reviewId: string;
  userId: Types.ObjectId;
  vendorId: Types.ObjectId;
  propertyId: Types.ObjectId;
  roomId?: Types.ObjectId;
  ratings: IRating;
  review?: string;
  status?: "pending" | "approved" | "disapproved";
  createdAt?: Date;
  updatedAt?: Date;
}


// Promotions
export interface IPromotion {
  promotionId: string;
  name: string;
  description: string;
  vendorId: Types.ObjectId;
  propertyId: Types.ObjectId;
  promotionDuration?: {
    start?: Date;
    end?: Date;
  };
  discountOffered: number;
  createdAt?: Date;
  updatedAt?: Date;
}
// User
export interface IUser extends Document {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profileImage?: string
  role: "USER" | "VENDOR" | "ADMIN";
  status: "pending" | "approved" | "suspended" | "disabled";
  provider: "google" | "github" | "linkedin";
  providerId: string;
  isEmailVerified: boolean;
  isNewsLatterSubscribed?: boolean;
  newsletterSubscribedAt?: Date;
  otp?: number
  otpExpiry?: Date
  createdAt?: Date;
  updatedAt?: Date;

  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface IEmail {
  to: string;
  subject: number;

}

export interface INotification extends Document {
  title: string;
  message: string;
  date: {
    startDate: Date;
    endDate: Date;
  }[];
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlatformSettings {
  platformName?: string;
  platformLogo?: string;
  platformDescription?: string;
  contactEmail?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISeoSettings {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalURL?: string;
  ogImage?: string;
  twitterCard?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Property SubSchemas
export interface IDiscount {
  type: "property" | "room";
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  discountPrice?: number;
  priceAfterDiscount?: number;
  isDiscountActive?: boolean;
}

export interface ICalendarEntry {
  startDate: Date;
  endDate: Date;
  status: "open" | "close";
  price?: number;
}

export interface IRoomDateAvailability {
  date: Date;
  remaining: number;
}

export interface IBedroomBeds {
  single?: number;
  double?: number;
  sofaCome?: number;
  queen?: number;
  king?: number;
  bunk?: number;
}

export interface ILivingRoomBeds {
  sofa?: number;
  sleeperSofas?: number;
  futons?: number;
  chair?: number;
}

export interface IBathroomDetails {
  isPrivate?: boolean;
  isInsideRoom?: boolean;
}

export interface IBreakfast {
  available?: boolean;
  included?: boolean;
  price?: string;
  types?: string[];
}

export interface IRoomDetails {
  roomType?: string;
  roomName?: string;
  customName?: string;
  noOfRooms?: number;
  dateWiseRemaining?: IRoomDateAvailability[];
}

export interface IRoomCleanlinessDisinfection {
  handSanitizer?: boolean;
}

// Amenities & Facilities

export interface ITopAmenities {
  airConditioning?: boolean;
  balcony?: boolean;
  bathtub?: boolean;
  view?: boolean;
  flatScreenTv?: boolean;
  privatePool?: boolean;
  terrace?: boolean;
  electricKettle?: boolean;
  spaTub?: boolean;
  teaMaker?: boolean;
  toiletPaper?: boolean;
  towels?: boolean;
  linens?: boolean;
}

export interface IRoomComfortFurniture {
  [key: string]: boolean | undefined;
}

export interface IBathroomAmenities {
  [key: string]: boolean | undefined;
}

export interface IMediaEntertainment {
  [key: string]: boolean | undefined;
}

// Property Subschemas

export interface IHostInfo {
  aboutUs?: string;
  role?: string;
  hostName?: string;
  hostPicture?: string;
}

export interface IRules {
  ageRestriction?: string;
  pets?: string;
  cancellationPolicy?: string;
}

export interface ISafetySecurity {
  security24h?: boolean;
  securityAlarm?: boolean;
  smokeAlarms?: boolean;
  cctvCommonAreas?: boolean;
  cctvOutsideProperty?: boolean;
  fireExtinguishers?: boolean;
  carbonMonoxideDetector?: boolean;
  carbonMonoxideSources?: boolean;
  safe?: boolean;
}

export interface IMiscellaneous {
  petBasket?: boolean;
  petBowls?: boolean;
  keyAccess?: boolean;
  keyCardAccess?: boolean;
  adultsOnly?: boolean;
  hypoallergenicRoomAvailable?: boolean;
  smokeFreeProperty?: boolean;
  designatedSmokingArea?: boolean;
  facilitiesForDisabledGuests?: boolean;
  elevator?: boolean;
  soundproofRooms?: boolean;
  heating?: boolean;
}

export interface IRoomsPolicy {
  familyOnly?: boolean;
  noParties?: boolean;
  noUnmarriedCouples?: boolean;
}

export interface IParking {
  available?: boolean;
  type?: "free" | "paid" | null;
  cost?: string;
  reservedSpot?: string | null;
  location?: string | null;
  parkingType?: string | null;
}

export interface ICheckInOut {
  from?: string;
  until?: string;
}

export interface IAvailability {
  type?: "limited" | "continuous";
  days?: number;
}

export interface IPriceForMeals {
  breakfast?: boolean;
  lunch?: boolean;
  dinner?: boolean;
}

// Room Schema
export interface IAmenities {
  status?: "pending" | "approved" | "disapproved";
  calendar?: ICalendarEntry[];
  roomDetails?: IRoomDetails;
  isDeleted?: boolean;
  nightlyPrice?: number;
  tax?: number;
  roomImages?: string[];
  guests?: number;
  bathrooms?: number;
  offerCrib?: "yes" | "no";
  apartmentSize?: string;
  sizeUnit?: string;
  childPolicy?: string;
  discount?: IDiscount;
  bedroomBeds?: IBedroomBeds;
  BathroomAmenities?: IBathroomAmenities;
  MediaEntertainment?: IMediaEntertainment;
  livingRoomBeds?: ILivingRoomBeds;
  breakfast?: IBreakfast;
  bathroomDetails?: IBathroomDetails[];
  CleanlinessDisinfection?: IRoomCleanlinessDisinfection;
  topAmenities?: ITopAmenities;
}

export interface IRoom {
  _id?: Types.ObjectId;
  roomId: string;
  calendar?: ICalendarEntry[];
  discount?: IDiscount;
  status?: "pending" | "approved" | "disapproved";
  tax?: number;
  roomImage?: string[];
  roomComfortFurniture?: IRoomComfortFurniture;
  roomDetail?: IRoomDetails;
  bedroomBeds?: IBedroomBeds;
  livingroomBeds?: ILivingRoomBeds;
  guests?: number;
  bathrooms?: number;
  offerCrib?: "yes" | "no";
  apartmentSize?: string;
  sizeUnit?: string;
  breakfast?: IBreakfast;
  bathroomDetails?: IBathroomDetails[];
  childPolicy?: string;
  amenities?: IAmenities;
  nightlyPrice?: number;
  isDeleted?: boolean;
}

// Property Base Schema

export interface IProperty {
  _id?: Types.ObjectId;
  vendorId: Types.ObjectId;
  propertyId: string;
  rooms?: IRoom[];
  status?: "pending" | "approved" | "disapproved";
  isDeleted?: boolean;
  noShowRequest?: boolean;
  isWishlisted?: boolean;
  category?: string;
  propertyName: string;
  propertyDescription?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  location?: any;
  parking?: IParking;
  checkIn?: ICheckInOut;
  checkOut?: ICheckInOut;
  availability?: IAvailability;
  topPropertyFacilities?: Record<string, boolean>;
  priceForMeals?: IPriceForMeals;
  languagesSpoken?: string[];
  buildingInfo?: { totalFloors?: number; totalRooms?: number };
  safetyFeatures?: Record<string, boolean>;
  physicalDistancing?: Record<string, boolean>;
  cleanlinessDisinfection?: Record<string, boolean>;
  foodDrinkSafety?: Record<string, boolean>;
  selfCheckIn?: Record<string, boolean>;
  activities?: Record<string, boolean>;
  poolAndSpa?: Record<string, boolean>;
  transportation?: Record<string, boolean>;
  frontDeskServices?: Record<string, boolean>;
  commonAreas?: Record<string, boolean>;
  entertainmentFamilyServices?: Record<string, boolean>;
  cleaningServices?: Record<string, boolean>;
  businessFacilities?: Record<string, boolean>;
  shops?: Record<string, boolean>;
  miscellaneous?: IMiscellaneous;
  safetySecurity?: ISafetySecurity;
  images?: string[];
  acceptedPaymentMethods?: string[];
  certifyChecked?: boolean;
  agreeChecked?: boolean;
  rules?: IRules;
  hostInfo?: IHostInfo;
  userAndVendorPolicy?: IRoomsPolicy;
  vendorAgreements?: string[];
  adminCommission?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Booking
export interface IBooking {
  bookingId: string;
  propertyId: Types.ObjectId;
  userId: Types.ObjectId;
  customerRequirements: {
    destination: string;
    checkIn: Date;
    checkOut: Date;
    numberOfRooms: number;
    numberOfAdults: number;
    numberOfChildren: number;
    selectedOption: string;
  };
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  phoneCode: string;
  bookingFor?: "main guest" | "other";
  workTravel?: "yes" | "no";
  shuttle?: boolean;
  carRental?: boolean;
  tax?: boolean;
  specialRequest?: string;
  parking?: boolean;
  arrivalTime?: string;
  isCribAvailable?: boolean;
  noOfCribs?: number;
  isExtraBedAvailable?: boolean;
  noOfExtraBeds?: number;
  bookingDate: {
    startDate: Date;
    endDate: Date;
  };
  stayDurationInDays: number;
  taxs?: number;
  discountApplied?: boolean;
  totalPrice: number;
  noOfRooms: number;
  rooms: {
    roomId: Types.ObjectId;
    calendar: {
      startDate: Date;
      endDate: Date;
      status: string;
      price: number;
    }[];
    roomDetail: {
      roomType: string;
      roomName: string;
      customName?: string;
      noOfRooms: number;
    };
    perNightPrice?: number;
    tax?: number;
    guests?: number;
    bathrooms?: number;
    apartmentSize?: string;
    sizeUnit?: string;
    breakfast?: {
      available: boolean;
      included: boolean;
      price?: string;
      types?: string[];
    };
    bathroomDetails?: {
      isPrivate: boolean;
      isInsideRoom: boolean;
    }[];
    childPolicy?: string;
  }[];
  property: {
    _id: Types.ObjectId;
    vendorId: string;
    status: string;
    category: string;
    propertyName: string;
    address: string;
    city: string;
    zip: string;
    country: string;
    location: {
      lat: number;
      lng: number;
    };
    checkIn: {
      from: string;
      until: string;
    };
    checkOut: {
      from: string;
      until: string;
    };
    acceptedPaymentMethods: string[];
    rules: {
      ageRestriction: string;
      pets: string;
      cancellationPolicy: string;
    };
  };
  isPaid?: boolean;
  paymentType?: "online" | "cash" | "through-vendor";
  status?: "pending" | "accepted" | "cancelled";
  adminCommission?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

