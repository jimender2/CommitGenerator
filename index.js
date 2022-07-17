const simpleGit = require('simple-git');
const mkdirp = require('mkdirp');
const fs = require('fs');
const faker = require("faker");
const path = require("path");
const cliProgress = require('cli-progress');


const argv = require('minimist')(process.argv.slice(2));

function generateRandomPost() {
    return {
        title: faker.lorem.words(5),
        date: faker.date.past(1),
        author: faker.name.findName(),
        body: faker.lorem.paragraphs(3).replace(/\n/gi, "\n\n"),
    };
}


async function asyncCall(argv) {

    let repoPath = ("path" in argv === true) ? argv["path"] : "path";

    let numberOfCommits = ("commits" in argv === true) ? Number(argv["commits"]) : 100;

    let initRepo = ("init" in argv === true) ? argv["init"] : false;

    let maxFilesPerCommit = ("maxFilesPerCommit" in argv === true) ? Number(argv["maxFilesPerCommit"]) : 100;

    const postsDir = path.join(__dirname, repoPath);

    mkdirp.sync(repoPath);

    const git = simpleGit(repoPath);

    if (initRepo) {
        await git.init();
    }


    console.log("Generating commits...");

    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    bar.start(numberOfCommits, 0);

    for (let i = 0; i < numberOfCommits; i++) {

        let postTitles = "";
        // Generate multiple posts
        for (let j = 0; j < Math.floor(Math.random() * maxFilesPerCommit); j++) {
            const post = generateRandomPost()
            const filePath = path.join(postsDir, `${post.title}.md`);

            postTitles += `* ${post.title}\n`;

            fs.writeFileSync(filePath, `---\ntitle: ${post.title}\nauthor: ${post.author}\ndate: ${post.date}\n---\n${post.body}`);

            await git.add(filePath);
        }

        await git.commit(`Added ${postTitles}`);

        bar.increment();
    }

    bar.stop();

}

asyncCall(argv)