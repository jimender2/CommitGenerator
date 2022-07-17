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
        let deletePostTitles = "";

        let writeFile = true;
        // Generate multiple posts
        for (let j = 0; j < Math.floor(Math.random() * maxFilesPerCommit); j++) {

            const post = generateRandomPost();

            // Edit a post or create a new one
            let type = Math.floor(Math.random() * 3);

            if (type === 0) {

                addPostTitles += `* ${post.title}\n`;

                writeFile = true;
            } else if (type === 1) {

                let files = fs.readdirSync(postsDir);
                let chosenFile = files[Math.floor(Math.random() * files.length)];

                post.title = chosenFile.split(".")[0];

                editPostTitles += `* ${post.title}\n`;

                writeFile = true;
            } else {

                let files = fs.readdirSync(postsDir);
                let chosenFile = files[Math.floor(Math.random() * files.length)];

                post.title = chosenFile.split(".")[0];

                deletePostTitles += `* ${post.title}\n`;

                writeFile = false;
            }

            const filePath = path.join(postsDir, `${post.title}.md`);

            try {
                if (writeFile) {
                    fs.writeFileSync(filePath, `---\ntitle: ${post.title}\nauthor: ${post.author}\ndate: ${post.date}\n---\n${post.body}`);
                } else {
                    fs.unlinkSync(filePath);
                }

                await git.add(filePath);

            } catch (e) {
            }
        }

        await git.commit(`Added ${addPostTitles}` + "\n" + `Edited ${editPostTitles}` + "\n" + `Deleted ${deletePostTitles}`);

        bar.increment();
    }

    bar.stop();

}

asyncCall(argv)