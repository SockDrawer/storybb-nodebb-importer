const fs = require('fs-extra');
const prompt = require('prompt');
const SqlString = require('sqlstring');
prompt.start();
const argv = require('yargs')
        .demandOption(['in', 'out', 'topic', 'board'])
        .argv
        
let inputJson

fs.ensureFile(argv.out)
.then(() => fs.readJson(argv.in))
.then(ij => {
    inputJson = ij;

  let members = {};
  
  //get all members
  let memberList = inputJson.posts.map((item) => item.user.username);
  memberList = memberList.filter((item, pos) => memberList.indexOf(item) == pos);
  
  console.log("please enter the user IDs for the following users:");
  return new Promise((resolve, reject) => {
      prompt.get(memberList, function(err, result) {
          if (err) return reject(err);
          else return resolve(result);
      });
  });
 }).then((users) => {
  
  let preamble = "INSERT INTO sbb_messages (id_topic, id_board, poster_time, id_member, poster_ip, subject, body) VALUES ";
  let posts = inputJson.posts.map((item) => `(${argv.topic}, ${argv.board}, ${item.timestamp}, ${users[item.user.username]}, "${item.ip}", ${SqlString.escape(inputJson.title)}, ${SqlString.escape(item.originalContent)})`);

  return fs.writeFile(argv.out, preamble + posts.join(',') + ';');
}).then(() => fs.appendFile(argv.out, `\nUPDATE sbb_topics SET num_replies=num_replies+${inputJson.posts.length} WHERE id_topic=${argv.topic}`));