const simpleGit = require('simple-git');
const mkdirp = require('mkdirp');
const fs = require('fs');
const faker = require("faker");
const path = require("path")

const argv = require('minimist')(process.argv.slice(2));

console.log(argv);

function generateRandomPost() {
    return {
        title: faker.lorem.words(5),
        date: faker.date.past(1),
        author: faker.name.findName(),
        body: faker.lorem.paragraphs(3).replace(/\n/gi, "\n\n"),
    };
}


async function asyncCall(argv) {

    let repoPath = ("path" in argv === true) ? argv["path"] : "path"

    let numberOfCommits = ("commits" in argv === true) ? Number(argv["commits"]) : 100

    let initRepo = ("init" in argv === true) ? argv["init"] : false

    const postsDir = path.join(__dirname, repoPath)

    mkdirp.sync(repoPath);

    const git = simpleGit(repoPath);

    if (initRepo) {
        await git.init();
    }

    for (let i = 0; i < numberOfCommits; i++) {
        const post = generateRandomPost()
        const filePath = path.join(postsDir, `${post.title}.md`);

        fs.writeFileSync(filePath, `---\ntitle: ${post.title}\nauthor: ${post.author}\ndate: ${post.date}\n---\n${post.body}`);

        await git.add(filePath);

        await git.commit(`Added ${post.title}`);

    }
}

asyncCall(argv)