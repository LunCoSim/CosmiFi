Project Concept Summary — Stage A & Stage B

This system is designed to enable engineers and designers to tokenize, share, trade, and assemble complex CAD-based designs on-chain, starting with individual digital components and eventually scaling to composable engineered systems (e.g., satellite made of parts).

Stage A — NFT Minting of Engineering Designs 

Goal

Allow trusted users to upload engineering design files, securely store them on IPFS, and mint NFTs that represent ownership of the design.

 Files Stored

Each design upload includes:

Asset	        | Description	                                            |Stored
Design          | JSON	Metadata (title, specs, description, creator info)	|IPFS (CID #1)
CAD File        | 	Actual CAD/CAE binary, zipped	                        | IPFS (CID #2)
Preview Image   |	Rendered screenshot of model                            |IPFS (CID #3)

So three CIDs are generated and linked in the NFT metadata on-chain.

 Workflow

Creator uploads CAD + metadata.

Files are pinned on IPFS (e.g., Pinata).

NFT is minted pointing to the metadata CID.

The preview image becomes the NFT display image.

NFT is assigned to the designer’s wallet.



 Frontend Display

The website shows:

Gallery of minted engineering NFTs

Preview images

Owner wallet address

Clickable profiles

Each NFT acts as a verifiable record of digital engineering work.



 User Benefits

Prove authorship of designs

Trade or license engineering IP

Introduce engineering assets into Web3


 Open Question from Stage A

How can other users use the design?



Stage B — Fractional Ownership & Composable Engineering NFTs
 Goal

Enable:

Feature	Meaning
Fractionalization	| Split a design NFT into ownership tokens
Composability	    | Combine multiple NFTs to form a parent NFT (e.g., spacecraft built from modules)
Cross-chain model	| Lock NFT on one chain, mint equivalent on another


1. Fractionalization

Design owner can:

Lock their NFT

Receive fractional tokens representing ownership

Sell/trade those tokens

Any holder who collects 100% of tokens can burn them to unlock the NFT


 Open Question from Stage B

 Value Determination Possibilities?
 currency of token recieved? ($FURMION??)



 2. Composable NFTs

Designs may represent subsystems (child NFTs):

Example	    |Child NFTs	                            |Parent NFT
Satellite	|Solar panel, antenna, thruster, frame	|Full satellite


 Mechanic

Each child NFT has metadata linking to a specific parent NFT (EIP-998).

Parent NFT exists in locked state at mint time.

When a wallet owns all children → parent unlocks.

If child is sold again, parent can lock again (optional rule).

This supports modular engineering and system-of-systems design.


 OR — Bottom-Up Composability (Parent Emerges Later)

(Parent not known until all components are gathered)

Child NFTs are minted independently and may not have a parent yet.

A user (or DAO/team) can combine a valid set of child NFTs.

Once the system verifies a full assembly set exists based on specific IDs →
a new parent NFT is minted dynamically.

The child NFTs may be:

Locked inside the parent forever (immortalized assembly)
OR

Still transferable (parent becomes inactive or updates if they leave)


Use-case: A user collects propulsion NFT + power module NFT + frame NFT → system grants a “complete spacecraft” NFT.

 Analogy
Model	    | How it feels
Top-down	| Pokemon — legendary exists, but requires collecting artifacts to unlock it
Bottom-up	| LEGO — you build a new model from blocks, then the game mints a unique “combined creation”


 When to use which
Scenario	            | Recommended Model
Known blueprint	        |    Top-down (parent known, locked until assembly)
Open-ended creativity	| Bottom-up (parent generated once assembly exists)



 3. Cross-Chain Bridge Logic

Model: Lock & Mint

Action	        |ETH Chain	            |Solana Chain
Bridge NFT	    |NFT locked in vault	|Wrapped NFT minted with same metadata
Return NFT	    |Wrapped NFT burned	    |Original NFT released

Ensures only one active version exists across all chains.

 High-Level Summary
Stage	|Outcome
A	    |Design NFTs uploaded, previewed, minted, owned, displayed
B	    |NFTs can be fractionalized, composably merged into higher-order designs, and moved cross-chain

At this point, the platform supports:

Engineering asset proof-of-ownership

Engineering intellectual property tokenization

Shared ownership of technological components

On-chain assembly of multi-component systems

Stage C later adds auto preview generation + simulation, bringing real engineering verification into Web3.
STILL WORKING ON STAGE C