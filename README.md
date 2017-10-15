# storybb-nodebb-importer
import from nodebb to storybb

Run like: `node index.js --in input.json --out output.txt --topic 4 --board 2`

- in is the input file: json like from https://nodebbforum.com/api/topic/23866?page=2
- out is the output file it will create locally
- topic is the NodeBB topic number
- board is the NodeBB board number

You'll want your member list open; it will ask you for a member ID for each person who posted in the thread so it can link the accounts. 