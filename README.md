What we've did so far to setup The Graph:

- Creating a subgraph on the The Graph website
- All the stuff in the beginning of installing cli, and init that we have the commands in the website (all options of the init were 'yes', startBlock=0 etc)
- Downloaded the graphql extension that is on github
- Updated the schema.graphql
- Called "graph codegen" after we updated the schema.graphql
- And now we updated the "nft-marketplace.ts" file from the "src" folder
- In the end we updated the subgraph.yaml in just 1 of the options: in the "startBlock". If it started from the startBlock=0 it would start indexing events from the beginning of Ethereum which would take a lot of time to run. So we copy pasted our contract goerli address to the goerli etherscan and saw in which block did we deploy the contract. We copied the block and took 1 block from it, so it will start counting from the block before the one our contract was deployed. (ex: our contract was deployed in block 8433646, so we defined startBlock=8433645)
- Deployed the subgraph (following the steps that we have in the Subgraph Studio), easy

So, we only updated:

- Schema.graphql
- src/nft-marketplace.ts
- Just 1 little update in subgraph.yaml that I explained above

All of this was super easy and super intuitive to make. Only thing we'll have to figure out in another project will be that logic that we used to create the table for activeItem to keep track of the nfts that we have visibly listed on the website, which they will only show as listed if they are address 0x000, and if a user cancels the listing it will have the 0x00dEaD address and if a user buys it, it will have the buyers address, so in those last 2 cases the nft wont have the 0x000 address so will stop being shown in the nft marketplace.
I'm assuming other projects may need similar or different logic for any logic they wanna create, or maybe it just updates each event object and its super straight forward and easy to code.
