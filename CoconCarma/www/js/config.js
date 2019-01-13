/* Formulas */
var colourPallets = {
    "Normal": ["rgb(105, 105, 105)", "white", "white"],
    "Error": ["hsl(357, 76%, 50%)", "white", "white"],
    "Succes": ["#B2DB77", "black", "white"],
    "Warning": ["hsl(51, 100%, 53%)", "black", "white"]
};

var defaults = {
    0: ['Remise pourcentage', -1, 3, 'P'],
    1: ['Remise euro', -1, 3, 'E'],

    2: ['Entrée', 4, 0, 'S'],
    3: ['Snack', 5, 0, [7.5, 11, 'Snack']],
    4: ['Salade/Buddha Bowl', 8, 0, [10, 13.5, 'Salade']],
    5: ['Végétarien', 8, 0, [10, 13.5, 'Végé']],
    6: ['Omnivore', 10, 0, [12, 15, 'Omni']],
    7: ['Dessert', 4, 0, 'D'],

    8: ['Eau détox', 1.5, 1],
    9: ['Eau minérale plate', 1.5, 1],
    10: ['Eau minérale gazeuse', 2.5, 1],
    11: ['Lait végétal', 2.5, 1],
    12: ['Jus fruits, légumes, smoothie', 5, 1],
    13: ['Expresso simple', 2, 1],
    14: ['Expresso double', 4, 1],
    15: ['Thé, rooibos, infusion', 2.5, 1],

    16: ['Jetable écologique', 0.5, 2],
    17: ['MontBento original', 30, 2],
    18: ['MontBento square', 25, 2],
    19: ['Kit 4 couverts inox', 2, 2],

    20: ['Magazine Bien-être', 4.5, 3, 'M'],
    21: ['Consigne 0.5€', 0.5, 2],
    22: ['Consigne 1€', 1, 2]
};

var currentMenuId = "Pri";

/* EXCEL */
var days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
var payments = {
    "cb": 5,
    "es": 6,
    "ti": 7,
    "ch": 8
};

var wscols = [{
    wch: 25
}, {
    wch: 16
}, {
    wch: 8
}, {
    wch: 8
}, {
    wch: 7
}, {
    wch: 13
}, {
    wch: 15
}];

