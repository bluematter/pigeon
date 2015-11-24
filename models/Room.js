/**
 *
 * @param id
 * @param name
 * @constructor
 */
function Room(id, name) {
    this.id = id;
    if (typeof name === 'undefined' || name === null) {
        this.name = id;
    } else {
        this.name = name;
    }
    this.people = [];
    this.peopleLimit = 500;
    this.status = "available";
    this.private = false;
};

Room.prototype.addPerson = function(personID) {
    if (this.status === "available") {
        this.people.push(personID);
    }
};

Room.prototype.removePerson = function(person) {
    var personIndex = -1;
    for(var i = 0; i < this.people.length; i++){
        if(this.people[i].id === person.id){
            personIndex = i;
            break;
        }
    }
    this.people.remove(personIndex);
};

Room.prototype.getPerson = function(personID) {
    var person = null;
    for(var i = 0; i < this.people.length; i++) {
        if(this.people[i].id == personID) {
            person = this.people[i];
            break;
        }
    }
    return person;
};

Room.prototype.isAvailable = function() {
    return this.available === "available";
};

Room.prototype.isPrivate = function() {
    return this.private;
};

module.exports = Room;