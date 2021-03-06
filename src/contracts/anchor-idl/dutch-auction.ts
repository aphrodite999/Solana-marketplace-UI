export const idlD = {
  version: "0.0.0",
  name: "dutch_auction",
  instructions: [
    {
      name: "initAuction",
      accounts: [
        {
          name: "initializer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mintAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "auctionAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name    : "clock",
          isMut   : false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "startingPrice",
          type: "u64",
        },
        {
          name: "reservedPrice",
          type: "u64",
        },
        {
          name: "priceStep",
          type: "u64",
        },
        {
          name: "interval",
          type: "u64",
        },
        {
          name: "auctionBump",
          type: "u8",
        },
      ],
    },
    {
      name:"cancelAuction",
      accounts:[
        {
          name:"initializer",
          isMut:true,
          isSigner:true
        },
        {
          name:"tokenAccount",
          isMut:true,
          isSigner:false
      },
        {
          name:"mintAccount",
          isMut:false,
          isSigner:false
        },
        {
          name:"auctionAccount",
          isMut:true,
          isSigner:false
        },
        {
          name:"tokenAuthority",
          isMut:false,
          isSigner:false
        },
        {
          name:"systemProgram",
          isMut:false,
          isSigner:false
        },
        {
          name:"tokenProgram",
          isMut:false,
          isSigner:false
        }
      ],
      args:[]
    },
    {
      name:"buy",
      accounts:[
        {
          name:"taker",
          isMut:true,
          isSigner:true
        },
        {
          name:"takerTokenAccount",
          isMut:true,
          isSigner:false
        },
        {
          name:"initializer",
          isMut:true,
          isSigner:false
        },
        {
          name:"initializerTokenAccount",
          isMut:true,
          isSigner:false
        },
        {
          name:"mintAccount",
          isMut:false,
          isSigner:false
        },
        {
          name:"auctionAccount",
          isMut:true,
          isSigner:false
        },
        {
          name:"salesTaxRecipient",
          isMut:true,
          isSigner:false
        },
        {
          name:"tokenAuthority",
          isMut:false,
          isSigner:false
        },
        {
          name:"metadataAccount",
          isMut:false,
          isSigner:false
        },
        {
          name:"systemProgram",
          isMut:false,
          isSigner:false
        },
        {
          name:"tokenProgram",
          isMut:false,
          isSigner:false
        },
        {
          name:"clock",
          isMut:false,
          isSigner:false
        }
      ],
      args:[
        {
          name:"fePrice",
          type:"u64"
        }
      ]
    }
  ],
  accounts: [
    {
      name:"AuctionAccount",
      type:{
        kind:"struct",
        fields:[
          {
            name:"initializerPubkey",
            type:"publicKey"
          },
          {
            name:"mintPubkey",
            type:"publicKey"
          },
          {
            name:"tokenAccountPubkey",
            type:"publicKey"
          },
          {
            name:"startingPrice",
            type:"u64"
          },
          {
            name:"reservedPrice",
            type:"u64"
          },
          {
            name:"priceStep",
            type:"u64"
          },
          {
            name:"interval",
            type:"u64"
          },
          {
            name:"startingTs",
            type:"i64"
          },
          {
            name:"bump","type":"u8"
          }
        ]
      }
    }
  ],
  types:[
    {
      name:"Key",
      type:{
        kind:"enum",
        variants:[
          {
            name:"Uninitialized"
          },
          {
            name:"EditionV1"
          },
          {
            name:"MasterEditionV1"
          },
          {
            name:"ReservationListV1"
          },
          {
            name:"MetadataV1"
          },
          {
            name:"ReservationListV2"
          },
          {
            name:"MasterEditionV2"
          },
          {
            name:"EditionMarker"
          }
        ]
      }
    },
    {
      name:"EscrowError",
      type:{
        kind:"enum",
        variants:[
          {
            name:"InvalidInstruction"
          },
          {
            name:"NotRentExempt"
          },
          {
            name:"ExpectedAmountMismatch"
          },
          {
            name:"AmountOverflow"
          },
          {
            name:"InvalidSalesTaxRecipient"
          },
          {
            name:"NumericConversionFailed"
          },
          {
            name:"InvalidMintAccount"
          },
          {
            name:"InvalidTokenAmount"
          },
          {
            name:"InvalidMetadata"
          },
          {
            name:"MissingMetadata"
          },
          {
            name:"InvalidFinalAmount"
          },
          {
            name:"InvalidRoyaltyFee"
          },
          {
            name:"CreatorMismatch"
          }
        ]
      }
    }
  ],
  errors:[
    {
      code:300,
      name:"IncorrectFrontendPrice",
      msg:"Incorrect Frontend Price"
    }
  ],
};
