const fs = require('fs-extra');
const prompt = require('prompt');
const SqlString = require('sqlstring');
const rp = require('request-promise');
prompt.start();
const argv = require('yargs')
        .demandOption(['out', 'topic', 'board'])
        .argv
        
let inputJson;

function fetchAllPages(topic, start, cookieJar, posts) {
    console.log(`getting page ${start}`);
    return rp({
        uri: `https://what.thedailywtf.com/api/topic/${topic}?page=${start}`,
        jar: cookieJar,
        json: true // Automatically parses the JSON string in the response
    }).then((results) => {
        posts = posts.concat(results.posts);
        
        if (results.pagination.next.active) {
            return fetchAllPages(topic, start+1, cookieJar, posts);
        } else {
            fs.writeJsonSync('debug.out', posts);
            return Promise.resolve({
                title: results.title,
                posts: posts
            });
        }
    });
        
}

function getPosts() {
    return new Promise((resolve, reject) => {
      prompt.get(['username', 'password'], function(err, result) {
        if (err) return reject(err);
        resolve(result);
      });
    }).then((result) => {
        const cookiejar = rp.jar();
        
        return rp({
            uri: 'https://what.thedailywtf.com/api/config',
            jar: cookiejar,
            json: true
        })
        .then((configBody) => rp({
            method: 'POST',
            uri: 'https://what.thedailywtf.com/login',
            jar: cookiejar,
            body: {
                'username': result.username,
                'password': result.password,
                'remember': 'off',
                'returnTo': 'http://what.thedailywtf.com'
            },
            headers: {
                'x-csrf-token': configBody.csrf_token,
                'User-Agent': 'Exporter 9000'
            },
            json: true // Automatically stringifies the body to JSON
        }))
        .then(() => fetchAllPages(argv.inTopic, 1, cookiejar, []));
    });
}

fs.ensureFile(argv.out)
.then(() => {
    if (argv.in) return fs.readJson(argv.in);
    if (argv.inTopic) return getPosts();
    Promise.reject('Please provide either an infile (--in) or an inTopic (--inTopic)');
})
.then(ij => {
    inputJson = ij;
  
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
  
  let preamble = "INSERT INTO sbb_messages (id_topic, id_board, poster_time, id_member, id_character, subject, body) VALUES ";
  let posts = inputJson.posts.map((item) => {
      
      return `(${argv.topic}, ${argv.board}, ${item.timestamp/1000}, ${users[item.user.username]}, (select id_character FROM sbb_characters WHERE is_main=1 and id_member=${users[item.user.username]}), ${SqlString.escape(inputJson.title)}, ${SqlString.escape(item.content)})`
    });

  return fs.writeFile(argv.out, preamble + posts.join(',') + ';');
}).then(() => fs.appendFile(argv.out, `\nUPDATE sbb_topics SET num_replies=num_replies+${inputJson.posts.length} WHERE id_topic=${argv.topic}`));
