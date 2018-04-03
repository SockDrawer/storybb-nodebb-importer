# storybb-nodebb-importer
import from nodebb to storybb

Run like: `node index.js --in input.json --out output.txt --topic 4 --board 2`

You can use `--in` if you have a downloaded json file, or `--inTopic` if you would prefer to supply credentials for the script to get the input itself.

- in is the input file: json like from https://nodebbforum.com/api/topic/23866?page=2
- inTopic is a nodeBB topic id
- out is the output file it will create locally
- topic is the storyBB topic number
- board is the storyBB board number

You'll want your member list open; it will ask you for a member ID for each person who posted in the thread so it can link the accounts. 

When the script has run, you will have a sql file you can run on the StoryBB server to import the topic. You can run that with the command:

`mysql -u username -p storybb < output.sql`

When you're done with your imports, under the Admin section, go to Maintenance -> Routine -> Recount all forum totals and statistics to update people's post counts and so on. You may also want to run "Find and repair any errors"
