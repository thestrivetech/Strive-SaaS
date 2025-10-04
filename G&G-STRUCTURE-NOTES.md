# Questions for Claude pertaining to the current project directory structure vs. what we want #
## Are these changes possible and will next.js best practices still be at play?

1. Move app/api/chat into app/app/api -> @Claude Is this possible? Why or why not?

2. Move all of the following into a newly created "styling" folder in app/app: favicon.io & global.css & layout.tsx & page.tsx -> Possible?

3. Is it possible to keep next.js best practices while making separate components, data, scripts, types, hooks, public (web and chatbot will be using the same public assets) and lib folders within each project (web, platform, and chatbot) -> I believe this will achieve the best level of organization when scaling in the future.
    - Extra context to take into account: The app/app/lib/middleware folder might have to stay in app/app to work correctly since it basically acts as the directories router. Correct?

### Final thoughts from user
-   All files inside of app/app/lib need to be moved to the correct location depending on what project it's being used in (web, platform, chatbot).
-   Make sure that since all 3 projects are using the same database is taken into account with this refactoring / directory-restructuring


# Notes for changes made by user
 Note We deleted "assets" from app/app since all content found within it already resides in app/app/public

