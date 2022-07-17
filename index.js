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

        let addPostTitles = "";
        let editPostTitles = "";
        // Generate multiple posts
        for (let j = 0; j < Math.floor(Math.random() * maxFilesPerCommit); j++) {

            const post = generateRandomPost();

            // Edit a post or create a new one
            let type = Math.floor(Math.random() * 2);

            if (type === 0) {

                addPostTitles += `* ${post.title}\n`;

            } else {

                let files = fs.readdirSync(postsDir);
                let chosenFile = files[Math.floor(Math.random() * files.length)];

                post.title = chosenFile.split(".")[0];

                editPostTitles += `* ${post.title}\n`;

            }

            const filePath = path.join(postsDir, `${post.title}.md`);

            fs.writeFileSync(filePath, `---\ntitle: ${post.title}\nauthor: ${post.author}\ndate: ${post.date}\n---\n${post.body}`);

            await git.add(filePath);

        }

        await git.commit(`Added ${addPostTitles}` + "\n" + `Edited ${editPostTitles}`);

        bar.increment();
    }

    bar.stop();

}

asyncCall(argv)