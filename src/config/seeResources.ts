// scripts/seedResources.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Resource from '../model/Resource';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

// Comprehensive sample data for each category
const resourcesData = [
  // ========== CROP GUIDES ==========
  {
    title: "Maize Farming: Complete Guide",
    description: "Learn everything about modern maize cultivation techniques",
    category: "crops",
    contentType: "article",
    imageUrl: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae",
    content: `Maize is one of the most important cereal crops worldwide. For successful cultivation:
    
1. **Land Preparation**: Plow deeply (20-25cm) and harrow to fine tilth. Maize grows best in well-drained loamy soils.
2. **Variety Selection**: Choose hybrid varieties like DK 8031 for high yields (8-10 tons/acre) or local varieties for organic farming.
3. **Planting**: Plant at onset of rains, spacing 75cm between rows and 30cm between plants. Sow 2 seeds per hole at 5cm depth.
4. **Fertilization**: Apply 200kg DAP/acre at planting and 150kg CAN/acre 3 weeks after germination.
5. **Weed Control**: Weed at 2 and 6 weeks after planting. Use mulch to suppress weeds.
6. **Pest Management**: Control stalk borers with neem extracts or approved pesticides.
7. **Harvesting**: Harvest when husks turn brown and kernels hard (about 3-4 months after planting).

Store in well-ventilated cribs to prevent aflatoxin contamination.`
  },
  {
    title: "Tomato Farming from Planting to Harvest",
    description: "Step-by-step guide to successful tomato cultivation",
    category: "crops",
    contentType: "video",
    videoUrl: "9bZkp7q19f0", // YouTube ID
    thumbnail: "https://i.ytimg.com/vi/9bZkp7q19f0/maxresdefault.jpg",
    duration: "15:22"
  },
  {
    title: "Organic Coffee Production Techniques",
    description: "Sustainable methods for high-quality coffee beans",
    category: "crops",
    contentType: "article",
    imageUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e",
    content: `**Organic Coffee Production Guide**

1. **Site Selection**: Choose shaded areas at 1200-1800m altitude with 1500-2000mm annual rainfall.

2. **Varieties**: Arabica (Coffea arabica) does best in organic systems. Recommended varieties: SL28, SL34, Ruiru 11.

3. **Nursery Management**:
   - Use organic potting mix (forest soil:compost 3:1)
   - Transplant 6-month old seedlings (30-40cm tall)
   - Space at 2.5m x 2.5m (1600 plants/acre)

4. **Soil Fertility**:
   - Apply 10kg compost/plant/year
   - Use legume cover crops (e.g., Mucuna, Desmodium)
   - Apply rock phosphate at 200kg/acre every 3 years

5. **Pest Control**:
   - Coffee berry borer: Use neem-based biopesticides
   - Antestia bugs: Plant repellent crops like garlic
   - Maintain 40-50% shade cover

6. **Harvesting**: Pick only ripe red cherries. Process within 12 hours of picking.

7. **Certification**: Allow 3-year conversion period before selling as organic.`
  },

  // ========== SOIL HEALTH ==========
  {
    title: "Improving Soil Fertility Naturally",
    description: "Organic methods to enrich your farm soil",
    category: "soil",
    contentType: "article",
    imageUrl: "https://images.unsplash.com/photo-1586771107445-d3ca888129ce",
    content: `**Natural Soil Fertility Enhancement Techniques**

1. **Composting**:
   - Layer green (nitrogen-rich) and brown (carbon-rich) materials
   - Turn pile every 2 weeks
   - Ready in 2-3 months

2. **Green Manure**:
   - Plant and plough under legumes like:
     * Crotalaria (sunhemp) - 3kg seeds/acre
     * Dolichos lablab - 5kg/acre
   - Incorporate 6-8 weeks before planting main crop

3. **Animal Manure**:
   - Apply well-decomposed manure at 5-10 tons/acre
   - Mix with ash to reduce acidity

4. **Biochar**:
   - Make from crop residues in kilns
   - Apply at 2-5 tons/acre to improve water retention

5. **Crop Rotation**:
   - Follow heavy feeders (maize) with legumes (beans)
   - Include deep-rooted crops to break hardpans

6. **Terra Preta Technique**:
   - Mix charcoal, pottery shards and organic waste
   - Bury in planting holes for long-term fertility`
  },
  {
    title: "Compost Making Demonstration",
    description: "How to create nutrient-rich compost from farm waste",
    category: "soil",
    contentType: "video",
    videoUrl: "EiEObwJVrpM",
    thumbnail: "https://i.ytimg.com/vi/EiEObwJVrpM/maxresdefault.jpg",
    duration: "10:45"
  },
  {
    title: "Soil Testing and Interpretation",
    description: "Understand your soil composition and needs",
    category: "soil",
    contentType: "video",
    videoUrl: "tmEj3MQPlTY",
    thumbnail: "https://i.ytimg.com/vi/tmEj3MQPlTY/maxresdefault.jpg",
    duration: "12:30"
  },

  // ========== PEST CONTROL ==========
  {
    title: "Natural Pest Control Methods",
    description: "Chemical-free solutions for common farm pests",
    category: "pests",
    contentType: "article",
    imageUrl: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144",
    content: `**Organic Pest Management Strategies**

1. **Botanical Pesticides**:
   - Neem extract: Crush 1kg leaves in 10L water, strain and spray
   - Tephrosia: Soak 500g leaves overnight, spray for caterpillars
   - Chili-garlic spray: Blend 100g chili + 100g garlic in 1L water

2. **Biological Controls**:
   - Trichoderma fungi for soil-borne diseases
   - Ladybugs for aphid control
   - Bacillus thuringiensis (Bt) for caterpillars

3. **Physical Barriers**:
   - Netting for fruit flies
   - Collars around stems to prevent cutworms
   - Sticky traps for flying insects

4. **Cultural Practices**:
   - Crop rotation to break pest cycles
   - Intercropping with repellent plants (e.g., onions with carrots)
   - Proper spacing for air circulation

5. **Pest-Specific Solutions**:
   - Fall armyworm: Apply wood ash in leaf whorls
   - Aphids: Spray soapy water (5ml liquid soap per liter)
   - Whiteflies: Use yellow sticky traps`
  },
  {
    title: "Making Organic Pesticides at Home",
    description: "DIY solutions using local materials",
    category: "pests",
    contentType: "video",
    videoUrl: "YkSU5dkAREA",
    thumbnail: "https://i.ytimg.com/vi/YkSU5dkAREA/maxresdefault.jpg",
    duration: "08:15"
  },
  {
    title: "Companion Planting Strategies",
    description: "Using plant combinations to deter pests naturally",
    category: "pests",
    contentType: "article",
    imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc",
    content: `**Effective Companion Planting Combinations**

1. **The Three Sisters**:
   - Corn (provides structure)
   - Beans (fix nitrogen)
   - Squash (shades soil, deters pests)

2. **Tomato Partners**:
   - Basil repels thrips and whiteflies
   - Marigolds deter nematodes
   - Onions mask tomato scent from pests

3. **Cabbage Family Protectors**:
   - Dill attracts beneficial wasps
   - Nasturtiums trap aphids
   - Rosemary repels cabbage moths

4. **Root Crop Companions**:
   - Carrots + onions (onions deter carrot fly)
   - Radishes with cucumbers (deters beetles)
   - Garlic around fruit trees (prevents borers)

5. **Trap Cropping**:
   - Plant sacrificial crops to lure pests away
   - Example: Blue Hubbard squash near cucumbers for squash bugs

6. **Beneficial Insect Attractors**:
   - Flowering plants like alyssum attract predators
   - Dill and fennel host ladybugs and lacewings`
  },

  // ========== IRRIGATION ==========
  {
    title: "Drip Irrigation System Installation",
    description: "Complete guide to water-efficient irrigation",
    category: "irrigation",
    contentType: "video",
    videoUrl: "xFrGZ-6FpFY",
    thumbnail: "https://i.ytimg.com/vi/xFrGZ-6FpFY/maxresdefault.jpg",
    duration: "14:30"
  },
  {
    title: "Rainwater Harvesting for Small Farms",
    description: "Techniques to collect and store rainwater",
    category: "irrigation",
    contentType: "article",
    imageUrl: "https://images.unsplash.com/photo-1625602812206-5ec545ca1231",
    content: `**Farm-Scale Rainwater Harvesting Systems**

1. **Roof Catchment**:
   - 100m² roof can collect ~75,000L/year in areas with 750mm rainfall
   - Use galvanized iron or tile roofs (avoid thatch)
   - Install gutter with first-flush diverter

2. **Ground Catchments**:
   - Construct 2% sloping surfaces toward storage
   - Use compacted clay or plastic liners
   - Plant grass strips to filter runoff

3. **Storage Options**:
   - Ferrocement tanks (5,000-50,000L capacity)
   - Polyethylene tanks (affordable for <10,000L)
   - Underground ponds for large storage

4. **Simple Calculations**:
   - Water need = Crop water requirement × Area × Season
   - Example: Maize needs 500mm = 5,000,000L/ha/season

5. **Distribution**:
   - Gravity flow for downhill fields
   - Low-cost solar pumps for upland areas
   - Drip kits for high-value crops

6. **Maintenance**:
   - Clean gutters before rains
   - Cover tanks to prevent algae
   - Treat water for drinking purposes`
  },
  {
    title: "Solar-Powered Irrigation Systems",
    description: "Sustainable water solutions using solar energy",
    category: "irrigation",
    contentType: "video",
    videoUrl: "hjkL91JKfFw",
    thumbnail: "https://i.ytimg.com/vi/hjkL91JKfFw/maxresdefault.jpg",
    duration: "18:45"
  }
];

// Function to seed database
export const seedDatabase = async () => {
  try {
    await Resource.deleteMany();
    await Resource.insertMany(resourcesData);
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};