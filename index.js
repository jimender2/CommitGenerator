const simpleGit = require('simple-git');
const mkdirp = require('mkdirp');
const fs = require('fs');
const faker = require("faker");
const path = require("path")



// var argv = require('minimist')(process.argv.slice(2));

// console.log(argv);

function generateRandomPost() {
    return {
        title: faker.lorem.words(5),
        date: faker.date.past(1),
        author: faker.name.findName(),
        body: faker.lorem.paragraphs(3).replace(/\n/gi, "\n\n"),
    };
}


async function asyncCall() {

    repoPath = "path"

    const postsDir = path.join(__dirname, repoPath)

    mkdirp.sync(repoPath);

    const git = simpleGit(repoPath);

    await git.init();

    for (let i = 0; i < 1000; i++) {
        const post = generateRandomPost()
        const filePath = path.join(postsDir, `${post.title}.md`);

        fs.writeFileSync(filePath, `---\ntitle: ${post.title}\nauthor: ${post.author}\ndate: ${post.date}\n---\n${post.body}`);

        await git.add(filePath);

        await git.commit(`Added ${post.title}`);

    }
}

asyncCall()