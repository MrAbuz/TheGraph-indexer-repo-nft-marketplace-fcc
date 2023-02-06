// Its in this "nft-marketplace.ts" file from the src that we're gonna tell our subgraph how to map and store all the event information
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
} from "../generated/schema"; //this is why we do "graph codegen" like I said in schema.graphql file im assuming. We have to import those types from there

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
  activeItem!.buyer = event.params.buyer; // ! is some typescript stuff which means we will have an activeItem, dont need to worry too much about it if we unfamiliar with typescript

  itemBought.save();
  activeItem!.save();
  // And this is how we're gonna save this itemBought event as an object in The Graph protocol, and also update out activeItem
  // Here with The Graph we're not gonna delete the activeItem (like in Moralis). We're just gonna say: If it has a buyer, it means it's been bought, if not, it's still on the market.
}
export function handleItemCanceled(event: ItemCanceledEvent): void {}

export function handleItemListed(event: ItemListedEvent): void {}

function getIdFromEventParams(tokenId: BigInt, nftAddress: Address): string {
  //the combination of "tokenId" and "nftAddress" will give an unique Id for each of the events (hmm, is it unique if there's more calls to that tokenId of that nft address?)
  //he said "and tokenId has a function called .toHexString()"
  return tokenId.toHexString() + nftAddress.toHexString();
}
