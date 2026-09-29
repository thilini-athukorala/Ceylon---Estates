// Sample data. Replace with fetch('/api/properties') once the Express API is ready.
export const properties = [
 {id:1,title:'Sea-view villa, Mirissa',type:'House',purpose:'Sale',price:78000000,city:'Mirissa',beds:4,baths:3,land:20,area:2600,furnished:true,parking:true,amenities:['Pool','Garden','Sea view'],hue:190},
 {id:2,title:'Modern apartment, Colombo 07',type:'Apartment',purpose:'Rent',price:185000,city:'Colombo',beds:2,baths:2,land:0,area:1150,furnished:true,parking:true,amenities:['Gym','Lift','Security'],hue:210},
 {id:3,title:'Hill bungalow, Kandy',type:'House',purpose:'Sale',price:42000000,city:'Kandy',beds:3,baths:2,land:15,area:1900,furnished:false,parking:true,amenities:['Garden','Mountain view'],hue:150},
 {id:4,title:'Fort-side studio, Galle',type:'Apartment',purpose:'Rent',price:95000,city:'Galle',beds:1,baths:1,land:0,area:520,furnished:true,parking:false,amenities:['Balcony','Wi-Fi'],hue:30},
 {id:5,title:'Coconut land, Negombo',type:'Land',purpose:'Sale',price:16500000,city:'Negombo',beds:0,baths:0,land:40,area:0,furnished:false,parking:false,amenities:['Road access','Water'],hue:100},
 {id:6,title:'Family home, Nugegoda',type:'House',purpose:'Sale',price:36500000,city:'Colombo',beds:4,baths:3,land:10,area:2100,furnished:false,parking:true,amenities:['Garden','Solar'],hue:260},
]
export const rs = n => 'Rs. ' + n.toLocaleString('en-LK')
