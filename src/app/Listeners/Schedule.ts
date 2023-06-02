import Job from "App/Models/Job";

export default class Schedule {
    async run() {
        const jobs = await Job.query()
            .withScopes(scopes => scopes.punctual('Renew'))
            .limit(10)
        if (jobs.length > 0) {
            for(const job of jobs) {
                await job.run()
            }
        }
    }
}
