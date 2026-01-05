import joi from 'joi';

// Register Schema
export const registerSchema = joi.object({
    name: joi.string().min(3).max(30).required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
    role: joi.string().valid('user', 'vendor', 'admin' ).optional()
})
// Login Schema
export const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(8).required()
})

// Rating Schema
export const ratingSchema = joi.object({
    hotelId: joi.string().required(),
    userId: joi.string().required(),
    staffBehavior: joi.number().integer().min(0).max(5).required(),
    serviceQuality: joi.number().integer().min(0).max(5).required(),
    cleanliness: joi.number().integer().min(0).max(5).required(),
    environment: joi.number().integer().min(0).max(5).required(),
    timing: joi.number().integer().min(0).max(5).required(),
    valueForMoney: joi.number().integer().min(0).max(5).required()
})

// Booking Schema
const bookingValidation = joi.object({
  vendorId: joi.string().required(),
  propertyId: joi.string().required(),
  userId: joi.string().required(),

  customerRequirements: joi.object({
    destination: joi.string().trim().required(),
    checkIn: joi.date().required(),
    checkOut: joi.date().required(),
    numberOfRooms: joi.number().required(),
    numberOfAdults: joi.number().required(),
    numberOfChildren: joi.number().required(),
    selectedOption: joi.string().required()
  }).required(),

  firstName: joi.string().required(),
  lastName: joi.string().required(),
  email: joi.string().email().required(),
  address: joi.string().required(),
  city: joi.string().required(),
  zip: joi.string().required(),
  country: joi.string().required(),
  phoneCode: joi.string().trim().required(),

  bookingFor: joi.string().valid("main guest", "other").default("main guest"),
  workTravel: joi.string().valid("yes", "no").default("yes"),

  shuttle: joi.boolean().default(false),
  carRental: joi.boolean().default(false),
  tax: joi.boolean().default(false),
  specialRequest: joi.string().trim().allow("", null),
  parking: joi.boolean().default(false),
  arrivalTime: joi.string().trim().allow("", null),

  isCribAvailable: joi.boolean().default(false),
  noOfCribs: joi.number().default(0),
  isExtraBedAvailable: joi.boolean().default(false),
  noOfExtraBeds: joi.number().default(0),

  bookingDate: joi.object({
    startDate: joi.date().required(),
    endDate: joi.date().required()
  }).required(),

  stayDurationInDays: joi.number().required(),
  taxs: joi.number().default(0).required(),
  discountApplied: joi.boolean().default(false),
  totalPrice: joi.number().required(),
  noOfRooms: joi.number().required(),

  rooms: joi.array().items(
    joi.object({
      roomId: joi.string().required(),
      calendar: joi.array().items(
        joi.object({
          startDate: joi.date(),
          endDate: joi.date(),
          status: joi.string(),
          price: joi.number()
        })
      ),
      roomDetails: joi.object({
        roomType: joi.string(),
        roomName: joi.string(),
        customName: joi.string(),
        noOfRooms: joi.number()
      }),
      perNightPrice: joi.number(),
      tax: joi.number(),
      guests: joi.number(),
      bathrooms: joi.number(),
      apartmentSize: joi.string(),
      sizeUnit: joi.string(),
      breakfast: joi.object({
        available: joi.boolean(),
        included: joi.boolean(),
        price: joi.string(),
        types: joi.array().items(joi.string())
      }),
      bathroomDetails: joi.array().items(
        joi.object({
          isPrivate: joi.boolean(),
          isInsideRoom: joi.boolean()
        })
      ),
      childPolicy: joi.string().allow("", null)
    })
  ),

  property: joi.object({
    _id: joi.string(),
    vendorId: joi.string(),
    propertyId: joi.string(),
    status: joi.string(),
    category: joi.string(),
    propertyName: joi.string(),
    address: joi.string(),
    city: joi.string(),
    zip: joi.string(),
    country: joi.string(),
    location: joi.object({
      lat: joi.number(),
      lng: joi.number()
    }),
    checkIn: joi.object({
      from: joi.string(),
      until: joi.string()
    }),
    checkOut: joi.object({
      from: joi.string(),
      until: joi.string()
    }),
    acceptedPaymentMethods: joi.array().items(joi.string()),
    rules: joi.object({
      ageRestriction: joi.string(),
      pets: joi.string(),
      cancellationPolicy: joi.string()
    })
  }),

  isPaid: joi.boolean().default(false),
  paymentType: joi.string().valid("online", "cash", "through-vendor").default("through-vendor"),
  status: joi.string().valid("pending", "accept", "canceled").default("pending"),
  adminCommission: joi.number().default(10)
})
// Payment
const paymentValidation = joi.object({
  vendorId: joi.string().required(),
  bookingId: joi.string().required(),
  transactionId: joi.string().required(),
  paymentType: joi.string().valid("online", "cash").default("online").required(),
  paymentAmount: joi.number().required(),
  paymentDate: joi.date().default(Date.now),
  isPaid: joi.boolean().default(false)
})
// Question
const questionValidation = joi.object({
  userId: joi.string().required(),
  vendorId: joi.string().required(),
  propertyId: joi.string().required(),
  question: joi.string().trim().required(),
  answer: joi.string().allow(null).optional(),
  status: joi.string().valid("pending", "approved", "rejected").default("pending"),
  answeredAt: joi.date().allow(null).optional(),
  approvedAt: joi.date().allow(null).optional(),
  approvedBy: joi.string().allow(null).optional()
})
// Review
const reviewValidation = joi.object({
  reviewId: joi.string().required(),
  userId: joi.string().required(),
  vendorId: joi.string().required(),
  propertyId: joi.string().required(),
  roomId: joi.string().optional(),
  ratings: joi.object({
    staff: joi.number().min(1).max(10).required(),
    facilities: joi.number().min(1).max(10).required(),
    cleanliness: joi.number().min(1).max(10).required(),
    comfort: joi.number().min(1).max(10).required(),
    valueForMoney: joi.number().min(1).max(10).required(),
    location: joi.number().min(1).max(10).required(),
    overall: joi.number().min(1).max(10).required()
  }).required(),
  review: joi.string().allow("").optional(),
  status: joi.string().valid("pending", "approved", "disapproved").default("pending")
})

// Property Validation Schemas

const ratePlanValidation = joi.object({
  planName: joi.string().required(),
  cancellationPolicy: joi.string().allow("", null).default(null),
  mealPlan: joi.string().allow("", null).default(null),
  price: joi.number().required(),
  discount: joi.number().min(0).max(100).default(0),
  additionalDetails: joi.string().allow("", null).default(null)
});

const roomOccupancyValidation = joi.object({
  adults: joi.number().min(1).required(),
  children: joi.number().min(0).default(0),
  maxGuests: joi.number().min(1).required(),
  infantPolicy: joi.string().allow("", null).default(null)
});

const propertyPoliciesValidation = joi.object({
  checkInFrom: joi.string().allow("", null).default(null),
  checkInUntil: joi.string().allow("", null).default(null),
  checkOutFrom: joi.string().allow("", null).default(null),
  checkOutUntil: joi.string().allow("", null).default(null),
  petsAllowed: joi.boolean().default(false),
  smokingAllowed: joi.boolean().default(false),
  partiesAllowed: joi.boolean().default(false),
  quietHours: joi.string().allow("", null).default(null)
});

const propertyRulesValidation = joi.object({
  houseRules: joi.array().items(joi.string()).default([]),
  languagesSpoken: joi.array().items(joi.string()).default([]),
  additionalRules: joi.string().allow("", null).default(null),
  propertyPolicies: propertyPoliciesValidation
});

const propertyContactValidation = joi.object({
  email: joi.string().email().required(),
  phoneNumber: joi.string().allow("", null).default(null),
  contactPerson: joi.string().allow("", null).default(null),
  emergencyPhoneNumber: joi.string().allow("", null).default(null)
});

const propertyLocationValidation = joi.object({
  address: joi.string().allow("", null).default(null),
  city: joi.string().allow("", null).default(null),
  state: joi.string().allow("", null).default(null),
  zipCode: joi.string().allow("", null).default(null),
  country: joi.string().allow("", null).default(null),
  latitude: joi.number().allow(null).default(null),
  longitude: joi.number().allow(null).default(null)
});

const propertyMediaValidation = joi.object({
  propertyImages: joi.array().items(joi.string()).default([]),
  propertyVideos: joi.array().items(joi.string()).default([]),
  featuredImage: joi.string().allow("", null).default(null)
});

const propertyDiscountValidation = joi.object({
  name: joi.string().allow("", null).default(null),
  description: joi.string().allow("", null).default(null),
  percentage: joi.number().min(0).max(100).default(0),
  startDate: joi.date().allow(null).default(null),
  endDate: joi.date().allow(null).default(null)
});

const nearbyPointsOfInterestValidation = joi.object({
  name: joi.string().allow("", null).default(null),
  distance: joi.number().allow(null).default(null),
  unit: joi.string().valid("m", "km", "mi").default("km"),
  category: joi.string().allow("", null).default(null)
});

const sustainabilityPracticesValidation = joi.object({
  recyclingBinsAvailable: joi.boolean().default(false),
  singleUsePlasticReduction: joi.boolean().default(false),
  energyEfficientLighting: joi.boolean().default(false),
  waterSavingToilets: joi.boolean().default(false),
  renewableEnergySource: joi.boolean().default(false),
  carbonFootprintOffset: joi.boolean().default(false),
  vegetarianFoodOptions: joi.boolean().default(false),
  locallySourcedFood: joi.boolean().default(false)
});

const accessibilityOptionsValidation = joi.object({
  wheelchairAccessible: joi.boolean().default(false),
  lowerBathroomSink: joi.boolean().default(false),
  raisedToilet: joi.boolean().default(false),
  emergencyCordInBathroom: joi.boolean().default(false),
  visualAidsBraille: joi.boolean().default(false),
  auditoryGuidance: joi.boolean().default(false),
  tactileSigns: joi.boolean().default(false),
  accessibleParking: joi.boolean().default(false)
});
const amenitiesAdditionalChargesValidation = joi.object({
  name: joi.string().required(),
  price: joi.number().required()
});


// Discount Schema
const discountValidation = joi.object({
  type: joi.string().valid("property", "room").required(),
  discountPercentage: joi.number().min(10).max(50).required(),
  startDate: joi.date().required(),
  endDate: joi.date().required(),
  discountPrice: joi.number().default(0),
  priceAfterDiscount: joi.number().default(0),
  isDiscountActive: joi.boolean().default(false)
});

// Calendar Entry Schema
const calendarEntryValidation = joi.object({
  startDate: joi.date().required(),
  endDate: joi.date().required(),
  status: joi.string().valid("open", "close").required(),
  price: joi.number()
});

// Bedroom Beds Schema
const bedroomBedsValidation = joi.object({
  single: joi.number().default(0),
  double: joi.number().default(0),
  sofaCome: joi.number().default(0),
  queen: joi.number().default(0),
  king: joi.number().default(0),
  bunk: joi.number().default(0)
});

// Living Room Beds Schema
const livingRoomBedsValidation = joi.object({
  sofa: joi.number().default(0),
  sleeperSofas: joi.number().default(0),
  futons: joi.number().default(0),
  chair: joi.number().default(0)
});

// Top Amenities Schema
const topAmenitiesValidation = joi.object({
  airConditioning: joi.boolean().default(false),
  balcony: joi.boolean().default(false),
  bathtub: joi.boolean().default(false),
  view: joi.boolean().default(false),
  flatScreenTv: joi.boolean().default(false),
  privatePool: joi.boolean().default(false),
  terrace: joi.boolean().default(false),
  electricKettle: joi.boolean().default(false),
  spaTub: joi.boolean().default(false),
  teaMaker: joi.boolean().default(false),
  toiletPaper: joi.boolean().default(false),
  towels: joi.boolean().default(false),
  linens: joi.boolean().default(false)
});

// Room Comfort Furniture Schema
const roomComfortFurnitureValidation = joi.object({
  childrensCribs: joi.boolean().default(false),
  clothesRack: joi.boolean().default(false),
  dryingRack: joi.boolean().default(false),
  foldUpBed: joi.boolean().default(false),
  sofaBed: joi.boolean().default(false),
  trashCans: joi.boolean().default(false),
  heatedPool: joi.boolean().default(false),
  infinityPool: joi.boolean().default(false),
  plungePool: joi.boolean().default(false),
  poolCover: joi.boolean().default(false),
  poolTowels: joi.boolean().default(false),
  poolView: joi.boolean().default(false),
  rooftopPool: joi.boolean().default(false),
  saltwaterPool: joi.boolean().default(false),
  shallowEnd: joi.boolean().default(false),
  privatePool: joi.boolean().default(false),
  dryer: joi.boolean().default(false),
  wardrobe: joi.boolean().default(false),
  carpeted: joi.boolean().default(false),
  walkIn: joi.boolean().default(false),
  extraLongBeds: joi.boolean().default(false),
  fan: joi.boolean().default(false),
  fireplace: joi.boolean().default(false),
  heating: joi.boolean().default(false),
  InterconnectingRoom: joi.boolean().default(false),
  iron: joi.boolean().default(false),
  ironingFacilities: joi.boolean().default(false),
  hotTub: joi.boolean().default(false),
  mosquitoNet: joi.boolean().default(false),
  privateEntrance: joi.boolean().default(false),
  safe: joi.boolean().default(false),
  sofa: joi.boolean().default(false),
  soundProof: joi.boolean().default(false),
  sittingArea: joi.boolean().default(false),
  tileFloor: joi.boolean().default(false),
  suitPress: joi.boolean().default(false),
  washingMachine: joi.boolean().default(false),
  hardwoodFloors: joi.boolean().default(false),
  desk: joi.boolean().default(false),
  hypoallergenic: joi.boolean().default(false),
  cleaningProducts: joi.boolean().default(false),
  electricBlankets: joi.boolean().default(false),
  pajamas: joi.boolean().default(false),
  yukata: joi.boolean().default(false),
  socket: joi.boolean().default(false),
  adapter: joi.boolean().default(false),
  featherPillow: joi.boolean().default(false),
  nonFeatherPillow: joi.boolean().default(false),
  hypoallergenicPillow: joi.boolean().default(false)
});

// Bathroom Amenities Schema
const bathroomAmenitiesValidation = joi.object({
  bidet: joi.boolean().default(false),
  bathTub: joi.boolean().default(false),
  bathrobe: joi.boolean().default(false),
  freeToiletries: joi.boolean().default(false),
  guestBathroom: joi.boolean().default(false),
  hairdryer: joi.boolean().default(false),
  spaTub: joi.boolean().default(false),
  sharedToilet: joi.boolean().default(false),
  sauna: joi.boolean().default(false),
  shower: joi.boolean().default(false),
  slippers: joi.boolean().default(false),
  toilet: joi.boolean().default(false),
  toothbrush: joi.boolean().default(false),
  shampoo: joi.boolean().default(false),
  conditioner: joi.boolean().default(false),
  bodySoap: joi.boolean().default(false),
  showerCap: joi.boolean().default(false)
});

// Media Entertainment Schema
const mediaEntertainmentValidation = joi.object({
  gameConsolePs4: joi.boolean().default(false),
  gameConsoleWiiU: joi.boolean().default(false),
  gameConsoleXboxOne: joi.boolean().default(false),
  computer: joi.boolean().default(false),
  gameConsole: joi.boolean().default(false),
  gameConsoleNintendoWii: joi.boolean().default(false),
  gameConsolePs2: joi.boolean().default(false),
  gameConsolePs3: joi.boolean().default(false),
  gameConsoleXbox360: joi.boolean().default(false),
  laptop: joi.boolean().default(false),
  ipad: joi.boolean().default(false),
  cableChannels: joi.boolean().default(false),
  cdPlayer: joi.boolean().default(false),
  dvdPlayer: joi.boolean().default(false),
  fax: joi.boolean().default(false),
  ipodDock: joi.boolean().default(false),
  laptopSafe: joi.boolean().default(false),
  payPerViewChannels: joi.boolean().default(false),
  radio: joi.boolean().default(false),
  satelliteChannels: joi.boolean().default(false),
  telephone: joi.boolean().default(false),
  tv: joi.boolean().default(false),
  video: joi.boolean().default(false),
  videoGames: joi.boolean().default(false),
  bluRayPlayer: joi.boolean().default(false),
  mobileHotspotDevice: joi.boolean().default(false),
  deviceBorrow: joi.boolean().default(false),
  smartphone: joi.boolean().default(false),
  streamingService: joi.boolean().default(false)
});

// Food Kitchen Facilities Schema
const foodKitchenFacilitiesValidation = joi.object({
  diningArea: joi.boolean().default(false),
  diningTable: joi.boolean().default(false),
  wineGlasses: joi.boolean().default(false),
  bottleOfWater: joi.boolean().default(false),
  chocolateCookies: joi.boolean().default(false),
  fruit: joi.boolean().default(false),
  wineChampagne: joi.boolean().default(false),
  barbecue: joi.boolean().default(false),
  oven: joi.boolean().default(false),
  stovetop: joi.boolean().default(false),
  toaster: joi.boolean().default(false),
  dishwasher: joi.boolean().default(false),
  outdoorDiningArea: joi.boolean().default(false),
  outdoorFurniture: joi.boolean().default(false),
  minibar: joi.boolean().default(false),
  kitchen: joi.boolean().default(false),
  kitchenette: joi.boolean().default(false),
  kitchenware: joi.boolean().default(false),
  microwave: joi.boolean().default(false),
  refrigerator: joi.boolean().default(false),
  apartment: joi.boolean().default(false),
  coffeeMachine: joi.boolean().default(false),
  highChair: joi.boolean().default(false)
});

// Services Extras Schema
const servicesExtrasValidation = joi.object({
  keyCardAccess: joi.boolean().default(false),
  lockers: joi.boolean().default(false),
  keyAccess: joi.boolean().default(false),
  executiveLoungeAccess: joi.boolean().default(false),
  alarmClock: joi.boolean().default(false),
  wakeUpService: joi.boolean().default(false),
  wakeUpServiceAlarmClock: joi.boolean().default(false),
  towelsSheetsExtraFee: joi.boolean().default(false)
});

// Views Outdoor Schema
const viewsOutdoorValidation = joi.object({
  balcony: joi.boolean().default(false),
  patio: joi.boolean().default(false),
  terrace: joi.boolean().default(false),
  cityView: joi.boolean().default(false),
  gardenView: joi.boolean().default(false),
  lakeView: joi.boolean().default(false),
  landmarkView: joi.boolean().default(false),
  mountainView: joi.boolean().default(false),
  poolView: joi.boolean().default(false),
  riverView: joi.boolean().default(false),
  seaView: joi.boolean().default(false),
  innerCourtyardView: joi.boolean().default(false),
  quietStreetView: joi.boolean().default(false)
});

// Accessibility Schema
const accessibilityValidation = joi.object({
  accessibleByElevator: joi.boolean().default(false),
  entireUnitGroundFloor: joi.boolean().default(false),
  entireUnitWheelchairAccessible: joi.boolean().default(false),
  hearingAccessible: joi.boolean().default(false),
  upperFloorsAccessibleByElevator: joi.boolean().default(false),
  upperFloorsAccessibleByStairsOnly: joi.boolean().default(false),
  adaptedBath: joi.boolean().default(false),
  emergencyCordInBathroom: joi.boolean().default(false),
  raisedToilet: joi.boolean().default(false),
  lowerSink: joi.boolean().default(false),
  rollInShower: joi.boolean().default(false),
  showerChair: joi.boolean().default(false),
  toiletWithGrabRails: joi.boolean().default(false),
  walkInShower: joi.boolean().default(false)
});

// Room Entertainment Family Services Schema
const roomEntertainmentFamilyServicesValidation = joi.object({
  babySafetyGates: joi.boolean().default(false),
  boardGamesPuzzles: joi.boolean().default(false),
  booksDvdsMusicForChildren: joi.boolean().default(false),
  childSafetySocketCovers: joi.boolean().default(false)
});

// Room Safety Security Schema
const roomSafetySecurityValidation = joi.object({
  carbonMonoxideDetector: joi.boolean().default(false),
  carbonMonoxideSources: joi.boolean().default(false),
  smokeAlarm: joi.boolean().default(false),
  fireExtinguisher: joi.boolean().default(false)
});

// Room Safety Features Schema
const roomSafetyFeaturesValidation = joi.object({
  airPurifiers: joi.boolean().default(false)
});

// Room Physical Distancing Schema
const roomPhysicalDistancingValidation = joi.object({
  sigleRoomAC: joi.boolean().default(false)
});

// Room Cleanliness Disinfection Schema
const roomCleanlinessDisinfectionValidation = joi.object({
  handSanitizer: joi.boolean().default(false)
});

// Amenities Schema
const amenitiesValidation = joi.object({
  TopAmenities: topAmenitiesValidation,
  RoomComfortFurniture: roomComfortFurnitureValidation,
  BathroomAmenities: bathroomAmenitiesValidation,
  MediaEntertainment: mediaEntertainmentValidation,
  FoodKitchenFacilities: foodKitchenFacilitiesValidation,
  ServicesExtras: servicesExtrasValidation,
  ViewsOutdoor: viewsOutdoorValidation,
  Accessibility: accessibilityValidation,
  EntertainmentFamilyServices: roomEntertainmentFamilyServicesValidation,
  SafetySecurity: roomSafetySecurityValidation,
  SafetyFeatures: roomSafetyFeaturesValidation,
  PhysicalDistancing: roomPhysicalDistancingValidation,
  CleanlinessDisinfection: roomCleanlinessDisinfectionValidation
});

// Breakfast Schema
const breakfastValidation = joi.object({
  available: joi.boolean().default(false),
  included: joi.boolean().default(false),
  price: joi.string().default(""),
  types: joi.array().items(joi.string()).default([])
});

// Room Date Availability Schema
const roomDateAvailabilityValidation = joi.object({
  date: joi.date().required(),
  remaining: joi.number().required()
});

// Room Details Schema
const roomDetailsValidation = joi.object({
  roomType: joi.string(),
  roomName: joi.string(),
  customName: joi.string(),
  noOfRooms: joi.number(),
  dateWiseRemaining: joi.array().items(roomDateAvailabilityValidation).default([])
});

// Bathroom Details Schema
const bathroomDetailsValidation = joi.object({
  isPrivate: joi.boolean().default(false),
  isInsideRoom: joi.boolean().default(false)
});

// Room Schema
const roomValidation = joi.object({
  status: joi.string().valid("pending", "approved", "disapproved").default("pending"),
  roomId: joi.string().required().trim(),
  calendar: joi.array().items(calendarEntryValidation).default([]),
  discount: discountValidation.optional(),
  roomDetails: roomDetailsValidation,
  isDeleted: joi.boolean().default(false),
  nightlyPrice: joi.number().default(0),
  tax: joi.number().default(0),
  roomImages: joi.array().items(joi.string()),
  bedroomBeds: bedroomBedsValidation,
  livingRoomBeds: livingRoomBedsValidation,
  guests: joi.number(),
  bathrooms: joi.number(),
  offerCrib: joi.string().valid("yes", "no"),
  apartmentSize: joi.string(),
  sizeUnit: joi.string(),
  breakfast: breakfastValidation,
  bathroomDetails: joi.array().items(bathroomDetailsValidation),
  childPolicy: joi.string(),
  amenities: amenitiesValidation
});

// Parking Schema
const parkingValidation = joi.object({
  available: joi.boolean().default(false),
  type: joi.string().valid("free", "paid", null).default(null),
  cost: joi.string().default(""),
  reservedSpot: joi.string().default(null),
  location: joi.string().default(null),
  parkingType: joi.string().default(null)
});

// Check In Out Schema
const checkInOutValidation = joi.object({
  from: joi.string().default(""),
  until: joi.string().default("")
});

// Availability Schema
const availabilityValidation = joi.object({
  type: joi.string().valid("limited", "continuous").default("limited"),
  days: joi.number().default(0)
});

// Top Property Facilities Schema
const topPropertyFacilitiesValidation = joi.object({
  beach: joi.boolean().default(false),
  swimmingPool: joi.boolean().default(false),
  bar: joi.boolean().default(false),
  sauna: joi.boolean().default(false),
  garden: joi.boolean().default(false),
  terrace: joi.boolean().default(false),
  nonSmokingRooms: joi.boolean().default(false),
  familyRooms: joi.boolean().default(false),
  hotTubJacuzzi: joi.boolean().default(false),
  airConditioning: joi.boolean().default(false)
});

// Price For Meals Schema
const priceForMealsValidation = joi.object({
  breakfast: joi.boolean().default(false),
  lunch: joi.boolean().default(false),
  dinner: joi.boolean().default(false)
});

// Building Info Schema
const buildingInfoValidation = joi.object({
  totalFloors: joi.number().default(0),
  totalRooms: joi.number().default(0)
});

// Safety Features Schema
const safetyFeaturesValidation = joi.object({
  staffSafetyProtocols: joi.boolean().default(false),
  sharedStationeryRemoved: joi.boolean().default(false),
  handSanitizer: joi.boolean().default(false),
  healthCheckProcess: joi.boolean().default(false),
  firstAidKits: joi.boolean().default(false),
  healthcareProfessionals: joi.boolean().default(false),
  thermometers: joi.boolean().default(false),
  faceMasks: joi.boolean().default(false)
});

// Physical Distancing Schema
const physicalDistancingValidation = joi.object({
  contactlessCheckIn: joi.boolean().default(false),
  cashlessPayment: joi.boolean().default(false),
  physicalDistancingRules: joi.boolean().default(false),
  mobileAppRoomService: joi.boolean().default(false),
  screensBarriers: joi.boolean().default(false)
});

// Cleanliness Disinfection Schema
const cleanlinessDisinfectionValidation = joi.object({
  cleaningChemicals: joi.boolean().default(false),
  linensWashed: joi.boolean().default(false),
  accommodationDisinfected: joi.boolean().default(false),
  accommodationSealed: joi.boolean().default(false),
  professionalCleaning: joi.boolean().default(false),
  cancelCleaningOption: joi.boolean().default(false)
});

// Food Drink Safety Schema
const foodDrinkSafetyValidation = joi.object({
  physicalDistancingDining: joi.boolean().default(false),
  foodDelivery: joi.boolean().default(false),
  tablewareSanitized: joi.boolean().default(false),
  breakfastToGo: joi.boolean().default(false),
  deliveredFoodCovered: joi.boolean().default(false)
});

// Self Check In Schema
const selfCheckInValidation = joi.object({
  passportsOnline: joi.boolean().default(false),
  checkInKiosk: joi.boolean().default(false),
  lockboxProperty: joi.boolean().default(false),
  lockboxSeparate: joi.boolean().default(false),
  mobileBluetoothRoom: joi.boolean().default(false),
  mobileInternetRoom: joi.boolean().default(false),
  pinCodeRoom: joi.boolean().default(false),
  qrCodeRoom: joi.boolean().default(false),
  checkInApp: joi.boolean().default(false),
  mobileBluetoothProperty: joi.boolean().default(false),
  mobileInternetProperty: joi.boolean().default(false),
  pinCodeProperty: joi.boolean().default(false),
  qrCodeProperty: joi.boolean().default(false),
  downloadableApp: joi.boolean().default(false)
});

// Activities Schema
const activitiesValidation = joi.object({
  tennisEquipment: joi.boolean().default(false),
  badmintonEquipment: joi.boolean().default(false),
  artGalleries: joi.boolean().default(false),
  barCrawls: joi.boolean().default(false),
  standUpComedy: joi.boolean().default(false),
  movieNights: joi.boolean().default(false),
  walkingTours: joi.boolean().default(false),
  bikeTours: joi.boolean().default(false),
  themedDinners: joi.boolean().default(false),
  happyHour: joi.boolean().default(false),
  localCultureTour: joi.boolean().default(false),
  cookingClass: joi.boolean().default(false),
  liveMusic: joi.boolean().default(false),
  liveSports: joi.boolean().default(false),
  archery: joi.boolean().default(false),
  aerobics: joi.boolean().default(false),
  bingo: joi.boolean().default(false),
  tennisCourt: joi.boolean().default(false),
  poolTable: joi.boolean().default(false),
  pingPong: joi.boolean().default(false),
  darts: joi.boolean().default(false),
  racquetball: joi.boolean().default(false),
  bowling: joi.boolean().default(false),
  miniGolf: joi.boolean().default(false),
  golfCourse: joi.boolean().default(false),
  waterPark: joi.boolean().default(false),
  waterSportsFacilities: joi.boolean().default(false),
  windsurfing: joi.boolean().default(false),
  diving: joi.boolean().default(false)
});

// Pool And Spa Schema
const poolAndSpaValidation = joi.object({
  waterslide: joi.boolean().default(false),
  beachChairsLoungers: joi.boolean().default(false),
  beachUmbrellas: joi.boolean().default(false),
  beautyServices: joi.boolean().default(false),
  spaFacilities: joi.boolean().default(false),
  steamRoom: joi.boolean().default(false),
  spaLoungeRelaxationArea: joi.boolean().default(false),
  footBath: joi.boolean().default(false),
  spaWellnessPackages: joi.boolean().default(false),
  massageChair: joi.boolean().default(false),
  fitness: joi.boolean().default(false),
  yogaClasses: joi.boolean().default(false),
  fitnessClasses: joi.boolean().default(false),
  personalTrainer: joi.boolean().default(false),
  lockerRooms: joi.boolean().default(false),
  kidsPool: joi.boolean().default(false),
  spa: joi.boolean().default(false),
  turkishSteamBath: joi.boolean().default(false),
  fitnessCenter: joi.boolean().default(false),
  solarium: joi.boolean().default(false),
  hotSpringBath: joi.boolean().default(false),
  massage: joi.boolean().default(false),
  openAirBath: joi.boolean().default(false),
  publicBath: joi.boolean().default(false)
});

// Transportation Schema
const transportationValidation = joi.object({
  publicTransitTickets: joi.boolean().default(false),
  shuttleService: joi.boolean().default(false),
  bicycleParking: joi.boolean().default(false),
  seeDetails: joi.boolean().default(false),
  bicycleRental: joi.boolean().default(false),
  carRental: joi.boolean().default(false),
  airportShuttle: joi.boolean().default(false),
  parking: joi.boolean().default(false)
});

// Front Desk Services Schema
const frontDeskServicesValidation = joi.object({
  invoiceProvided: joi.boolean().default(false),
  frontDesk24h: joi.boolean().default(false),
  privateCheckInOut: joi.boolean().default(false),
  expressCheckInOut: joi.boolean().default(false),
  concierge: joi.boolean().default(false),
  tourDesk: joi.boolean().default(false),
  currencyExchange: joi.boolean().default(false),
  atmOnSite: joi.boolean().default(false),
  baggageStorage: joi.boolean().default(false),
  lockers: joi.boolean().default(false)
});

// Common Areas Schema
const commonAreasValidation = joi.object({
  outdoorFurniture: joi.boolean().default(false),
  picnicArea: joi.boolean().default(false),
  indoorFireplace: joi.boolean().default(false),
  outdoorFireplace: joi.boolean().default(false),
  sunDeck: joi.boolean().default(false),
  sharedKitchen: joi.boolean().default(false),
  sharedLoungeTvArea: joi.boolean().default(false),
  gameRoom: joi.boolean().default(false),
  chapelShrine: joi.boolean().default(false)
});

// Entertainment Family Services Schema
const entertainmentFamilyServicesValidation = joi.object({
  boardGamesPuzzles: joi.boolean().default(false),
  indoorPlayArea: joi.boolean().default(false),
  outdoorPlayEquipmentForKids: joi.boolean().default(false),
  babySafetyGates: joi.boolean().default(false),
  strollers: joi.boolean().default(false),
  eveningEntertainment: joi.boolean().default(false),
  nightclubDj: joi.boolean().default(false),
  casino: joi.boolean().default(false),
  karaoke: joi.boolean().default(false),
  entertainmentStaff: joi.boolean().default(false),
  kidsClub: joi.boolean().default(false),
  playground: joi.boolean().default(false),
  babysittingChildServices: joi.boolean().default(false)
});

// Cleaning Services Schema
const cleaningServicesValidation = joi.object({
  dryCleaning: joi.boolean().default(false),
  ironingService: joi.boolean().default(false),
  laundry: joi.boolean().default(false),
  dailyHousekeeping: joi.boolean().default(false),
  suitPress: joi.boolean().default(false)
});

// Business Facilities Schema
const businessFacilitiesValidation = joi.object({
  meetingBanquetFacilities: joi.boolean().default(false),
  businessCenter: joi.boolean().default(false),
  faxPhotocopying: joi.boolean().default(false)
});

// Shops Schema
const shopsValidation = joi.object({
  convenienceStoreOnSite: joi.boolean().default(false),
  hairBeautySalon: joi.boolean().default(false)
});

// Miscellaneous Schema
const miscellaneousValidation = joi.object({
  petBasket: joi.boolean().default(false),
  petBowls: joi.boolean().default(false),
  keyAccess: joi.boolean().default(false),
  keyCardAccess: joi.boolean().default(false),
  adultsOnly: joi.boolean().default(false),
  hypoallergenicRoomAvailable: joi.boolean().default(false),
  smokeFreeProperty: joi.boolean().default(false),
  designatedSmokingArea: joi.boolean().default(false),
  facilitiesForDisabledGuests: joi.boolean().default(false),
  elevator: joi.boolean().default(false),
  soundproofRooms: joi.boolean().default(false),
  heating: joi.boolean().default(false)
});

// Safety Security Schema
const safetySecurityValidation = joi.object({
  security24h: joi.boolean().default(false),
  securityAlarm: joi.boolean().default(false),
});
export const propertySchema = joi.object({
  vendorId: joi.string().required(),
  propertyName: joi.string().required(),
  description: joi.string().allow("", null),
  category: joi.string().allow("", null).default(null),
  starRating: joi.number().min(0).max(5).default(0),
  propertyContact: propertyContactValidation.default({}),
  location: propertyLocationValidation.default({}),
  media: propertyMediaValidation.default({}),
  amenities: topAmenitiesValidation.default({}),
  roomComfortFurniture: roomComfortFurnitureValidation.default({}),
  bathroomAmenities: bathroomAmenitiesValidation.default({}),
  mediaEntertainment: mediaEntertainmentValidation.default({}),
  foodKitchenFacilities: foodKitchenFacilitiesValidation.default({}),
  propertyFacilities: topPropertyFacilitiesValidation.default({}),
  parking: parkingValidation.default({}),
  checkInOut: checkInOutValidation.default({}),
  availability: availabilityValidation.default({}),
  buildingInfo: buildingInfoValidation.default({}),
  safetyFeatures: safetyFeaturesValidation.default({}),
  physicalDistancing: physicalDistancingValidation.default({}),
  cleanlinessDisinfection: cleanlinessDisinfectionValidation.default({}),
  foodDrinkSafety: foodDrinkSafetyValidation.default({}),
  selfCheckIn: selfCheckInValidation.default({}),
  activities: activitiesValidation.default({}),
  poolAndSpa: poolAndSpaValidation.default({}),
  transportation: transportationValidation.default({}),
  frontDeskServices: frontDeskServicesValidation.default({}),
  commonAreas: commonAreasValidation.default({}),
  entertainmentFamilyServices: entertainmentFamilyServicesValidation.default({}),
  cleaningServices: cleaningServicesValidation.default({}),
  businessFacilities: businessFacilitiesValidation.default({}),
  shops: shopsValidation.default({}),
  miscellaneous: miscellaneousValidation.default({}),
  safetySecurity: safetySecurityValidation.default({}),
  sustainabilityPractices: sustainabilityPracticesValidation.default({}),
  accessibilityOptions: accessibilityOptionsValidation.default({}),
  ratePlans: joi.array().items(ratePlanValidation).default([]),
  roomOccupancy: roomOccupancyValidation.default({}),
  propertyRules: propertyRulesValidation.default({}),
  extraCharges: joi.array().items(amenitiesAdditionalChargesValidation).default([]),
  nearbyPointsOfInterest: joi.array().items(nearbyPointsOfInterestValidation).default([]),
  discount: propertyDiscountValidation.allow(null).default(null)
});
