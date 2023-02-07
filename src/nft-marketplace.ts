// Its in this "nft-marketplace.ts" file from the src that we're gonna tell our subgraph how to map and store all the event information
// Super easy the syntax and easy to do all this The Graph code from the beginning to the end
// Read the README.md

import { BigInt, Address } from "@graphprotocol/graph-ts"; // two special types that come from The Graph
import {
  ItemBought as ItemBoughtEvent,
  ItemCanceled as ItemCanceledEvent,
  ItemListed as ItemListedEvent,
} from "../generated/NftMarketplace/NftMarketplace"; //we're importing our events from our generated code
import {
  ActiveItem,
  ItemBought,
  ItemCanceled,
  ItemListed,
} from "../generated/schema"; //this is why we do "graph codegen" like I said in schema.graphql file im assuming. We have to import those types from generated/schema

export function handleItemListed(event: ItemListedEvent): void {
  let itemListed = ItemListed.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  if (!itemListed) {
    itemListed = new ItemListed(
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }
  if (!activeItem) {
    //since this ItemListed event is also used for update listing, in that case there's already an activeItem. If its emited because a listing was created, there wont be an activeItem.
    activeItem = new ActiveItem(
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }
  itemListed.seller = event.params.seller;
  activeItem.seller = event.params.seller;

  itemListed.nftAddress = event.params.nftAddress;
  activeItem.nftAddress = event.params.nftAddress;

  itemListed.tokenId = event.params.tokenId;
  activeItem.tokenId = event.params.tokenId;

  itemListed.price = event.params.price;
  activeItem.price = event.params.price;

  activeItem.buyer = Address.fromString(
    //so we initialize the buyer as the 0x000 address
    "0x0000000000000000000000000000000000000000"
  );

  itemListed.save();
  activeItem.save();
}

export function handleItemBought(event: ItemBoughtEvent): void {
  // This functions are basically saying: whenever an "ItemBoughtEvent" occurs, do this "handleItemBought()" function
  // 1. Save that event in our graph
  // 2. Update our ActiveItem (as we did in Moralis)
  //
  // Get or create an itembought object
  // Each item needs a unique Id (and we need to create it)
  //
  // Right now we have:
  // ItemBoughtEvent: Just the raw event
  // But we dont have:
  // ItemBoughtObject: What we save. We have to create an ItemBoughtObject from our ItemBoughtEvent. We're importing from generated/schema
  //
  // Let's go ahead and get or create an itemBought object:
  let itemBought = ItemBought.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  if (!itemBought) {
    itemBought = new ItemBought(
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }
  // Now we'll update all its parameters:
  itemBought.buyer = event.params.buyer;
  itemBought.nftAddress = event.params.nftAddress;
  itemBought.tokenId = event.params.tokenId;
  // Only thing we have to update activeItem is the buyer:
  // Here with The Graph we're not gonna delete the activeItem (like in Moralis).
  // We're just gonna say: If it has a buyer, it means it's been bought, if not, it's still on the market.
  activeItem!.buyer = event.params.buyer; // ! is some typescript stuff which means we will have an activeItem, dont need to worry too much about it if we unfamiliar with typescript

  itemBought.save();
  activeItem!.save();
  // And this is how we're gonna save this itemBought event as an object in The Graph protocol, and also update out activeItem
}
export function handleItemCanceled(event: ItemCanceledEvent): void {
  let itemCanceled = ItemCanceled.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  if (!itemCanceled) {
    //which there shouldnt be
    itemCanceled = new ItemCanceled(
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }

  itemCanceled.seller = event.params.seller;
  itemCanceled.nftAddress = event.params.nftAddress;
  itemCanceled.tokenId = event.params.tokenId;

  //we're gonna give it what is called, the dead address
  activeItem!.buyer = Address.fromString(
    "0x000000000000000000000000000000000000dEaD"
  );

  itemCanceled.save();
  activeItem!.save();
}

function getIdFromEventParams(tokenId: BigInt, nftAddress: Address): string {
  //this is the ID
  //the combination of "tokenId" and "nftAddress" will give an unique Id for each of the events (hmm, is it unique if there's more calls to that tokenId of that nft address?)
  //he said "and tokenId has a function called .toHexString()"
  return tokenId.toHexString() + nftAddress.toHexString();
}

//So, when its listed, we initialize the buyer in the ActiveItem object as the 0x0000 address.
//    when its bought, we update the buyer with the buyers address.
//    when its canceled, we update the buyer with the 0x000dEaD address

//So instead of deleting the ActiveItem object when its bought or canceled (like we did in Moralis), if its 0x000 address its good and keeps being listed, if there's a buyer address
//we'll remove it from listing, and if it has the 0x000deAd address we remove it from listing aswell
//Basically, it will only be listed and on the market if the buyers address is just zeros "0x000000..."
