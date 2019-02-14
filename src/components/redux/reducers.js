
const initialState = {
    user: undefined
}
export default (state = initialState, action) => {
    switch (action.type) {
        case 'SAVEUSER':
            return {
                user: action.payload
            };
        case 'REMOVEUSER':
            return {
                user: {}
            };
        case 'UPDATEAVATAR':
            return {
                user: action.payload
            };
        default: 
            return state;
    }
}