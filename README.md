# Vehiclehop

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Lints and fixes files
```
npm run lint
```

### Architecture and dependency
In addition to the present project architecture. 
- I have added a layer for api/business logic using the factory/repository pattern.
This ensures data access code can be decoupled, reused and domain logic easier to implement. An alternative would be to use Vuex as a layer
for all api and data transactions.
- A new file is added to structure for axios client. The choice to use the repository pattern supported a move for using axios over fetch.
There are a lot of pros to this. But the simplest is the ability to fetch data outside the vue instance.
- Constants: All constants can be found here. (Reason: reusabilty)
- Toasters: To ensure users get informed if data is not gotten or api fails, I installed vue-toasted for error feedback.

### General thoughts
Though this is production ready, it is still open for feedback from the product owner. In a real development situation, I would have loved to ask a
couple of questions. An example would be:
Presently, the user can see cars in other locations asides the selected location if they choose to zoom out. Is this okay with you or you would 
love to see only cars based on selected location.
I believe questions such as this would help shape my decision making and reduce conflict.

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
