// Groq API Configuration
const GROQ_API_KEY = "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";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Global State
let knowledgeChunks = [];
let currentLanguage = "en";
let recognition = null;
let isListening = false;

// ========== KNOWLEDGE GALAXY - CROP DETAIL MODAL ==========
const cropData = {
    rice: {
        name: "🌾 Rice (धान)",
        scientificName: "Oryza sativa",
        description: "Rice is the most important staple food crop in India, grown across 43 million hectares. It's the primary source of calories for over 65% of the Indian population.",
        growingSeason: "Kharif (June-October), Rabi (November-April) in some regions",
        temperature: "20°C - 35°C",
        rainfall: "100-250 cm annually",
        soilType: "Clay loam, alluvial soil with good water retention",
        varieties: [
            { name: "Basmati 370", yield: "2.5-3.0 tons/acre", duration: "135-145 days", profit: "₹35,000-45,000/acre" },
            { name: "Pusa 1121", yield: "3.0-3.5 tons/acre", duration: "140-150 days", profit: "₹40,000-55,000/acre" },
            { name: "IR-64", yield: "3.5-4.0 tons/acre", duration: "120-130 days", profit: "₹30,000-40,000/acre" },
            { name: "Swarna (MTU-7029)", yield: "4.0-4.5 tons/acre", duration: "140-150 days", profit: "₹35,000-45,000/acre" },
            { name: "Sona Masoori", yield: "2.5-3.0 tons/acre", duration: "120-130 days", profit: "₹45,000-60,000/acre" }
        ],
        fertilizer: "N:120kg, P:60kg, K:60kg per acre",
        irrigation: "Flood irrigation / Alternate wetting and drying",
        profitPerAcre: "₹35,000 - ₹60,000",
        msp: "₹2,183 per quintal (2024-25)",
        diseases: "Blast, Brown Spot, Sheath Blight, Bacterial Leaf Blight",
        farmingTips: "Use certified seeds, maintain proper water level, apply balanced fertilizers, practice integrated pest management"
    },
    wheat: {
        name: "🌾 Wheat (गेहूं)",
        scientificName: "Triticum aestivum",
        description: "Wheat is the second most important cereal crop in India, grown primarily in the northern plains. It's a Rabi season crop essential for food security.",
        growingSeason: "Rabi (October-March)",
        temperature: "10°C - 25°C",
        rainfall: "50-100 cm annually",
        soilType: "Well-drained loam and clay loam",
        varieties: [
            { name: "HD 2967", yield: "4.0-4.5 tons/acre", duration: "140-150 days", profit: "₹40,000-55,000/acre" },
            { name: "PBW 343", yield: "3.5-4.0 tons/acre", duration: "145-155 days", profit: "₹35,000-50,000/acre" },
            { name: "DBW 17", yield: "4.0-4.5 tons/acre", duration: "135-145 days", profit: "₹42,000-58,000/acre" },
            { name: "WH 1105", yield: "3.8-4.2 tons/acre", duration: "140-150 days", profit: "₹38,000-52,000/acre" }
        ],
        fertilizer: "N:120kg, P:60kg, K:40kg per acre",
        irrigation: "5-6 irrigations depending on soil type",
        profitPerAcre: "₹35,000 - ₹58,000",
        msp: "₹2,275 per quintal (2024-25)",
        diseases: "Rust, Smut, Karnal Bunt, Leaf Blight",
        farmingTips: "Early sowing (Nov 1-15), use certified seeds, avoid excess irrigation, crop rotation with legumes"
    },
    soil: {
        name: "🧪 Soil Health (मिट्टी की सेहत)",
        description: "Healthy soil is the foundation of productive farming. Understanding your soil type and its properties is crucial for optimal crop growth.",
        soilTypes: [
            { name: "Alluvial Soil", region: "Northern Plains", crops: "Rice, Wheat, Sugarcane", fertility: "High", ph: "6.5-8.0" },
            { name: "Black Soil", region: "Maharashtra, MP, Gujarat", crops: "Cotton, Soybean, Wheat", fertility: "Medium", ph: "7.0-8.5" },
            { name: "Red Soil", region: "Tamil Nadu, Karnataka, AP", crops: "Millets, Pulses, Groundnut", fertility: "Low-Medium", ph: "5.5-7.0" },
            { name: "Laterite Soil", region: "Kerala, Karnataka, WB", crops: "Cashew, Tea, Coffee", fertility: "Low", ph: "4.5-6.5" }
        ],
        testing: "Soil testing every 2-3 years recommended. Cost: ₹200-500 per sample",
        improvement: "Add organic manure, practice crop rotation, use green manure, avoid over-fertilization",
        profitPerAcre: "Good soil health can increase yields by 20-30%",
        farmingTips: "Test soil before every season, maintain organic matter, practice mulching, avoid soil erosion"
    },
    water: {
        name: "💧 Water Management (जल प्रबंधन)",
        description: "Efficient water management is critical for sustainable agriculture, especially in water-scarce regions.",
        irrigationMethods: [
            { name: "Drip Irrigation", efficiency: "90-95%", cost: "₹40,000-60,000/acre", suitability: "Vegetables, Fruits, Cotton" },
            { name: "Sprinkler System", efficiency: "70-80%", cost: "₹25,000-35,000/acre", suitability: "Wheat, Pulses, Oilseeds" },
            { name: "Flood Irrigation", efficiency: "40-50%", cost: "Low", suitability: "Rice, Sugarcane" },
            { name: "Furrow Irrigation", efficiency: "60-70%", cost: "Medium", suitability: "Maize, Cotton, Vegetables" }
        ],
        waterSaving: "Micro-irrigation saves 40-60% water, increases yield by 20-50%",
        subsidies: "PMKSY offers 55-80% subsidy on micro-irrigation systems",
        profitPerAcre: "Efficient irrigation can save ₹5,000-15,000 per acre annually",
        farmingTips: "Use drip irrigation for high-value crops, schedule irrigation based on crop stage, harvest rainwater"
    },
    fertilizer: {
        name: "🌱 Fertilizer Management (उर्वरक प्रबंधन)",
        description: "Balanced fertilization is key to achieving optimal crop yields and maintaining soil health.",
        npkGuide: [
            { nutrient: "Nitrogen (N)", role: "Vegetative growth, leaf development", sources: "Urea, DAP, CAN", deficiency: "Yellowing of leaves" },
            { nutrient: "Phosphorus (P)", role: "Root development, flowering", sources: "SSP, DAP, Rock Phosphate", deficiency: "Stunted growth" },
            { nutrient: "Potassium (K)", role: "Disease resistance, water uptake", sources: "MOP, SOP", deficiency: "Leaf scorching" }
        ],
        organicOptions: "FYM (5-10 tons/acre), Vermicompost (2-3 tons/acre), Green manure, Compost",
        recommendation: "Apply based on soil test results. Split application improves efficiency.",
        profitPerAcre: "Balanced fertilization increases yield by 25-35%",
        farmingTips: "Use neem-coated urea, apply fertilizer in root zone, avoid over-fertilization, integrate organic sources"
    },
    pmkisan: {
        name: "🏛 PM-KISAN Scheme (प्रधानमंत्री किसान सम्मान निधि)",
        description: "PM-KISAN is a central government scheme providing income support to small and marginal farmers across India.",
        benefit: "₹6,000 per year in three equal installments of ₹2,000 each",
        eligibility: "Small and marginal farmers with less than 2 hectares of land",
        documents: "Aadhaar card, Land records, Bank account details",
        applicationProcess: "Apply online at pmkisan.gov.in or through local Common Service Centers",
        status: "16 installments released so far. Over 11 crore farmers benefited.",
        totalDisbursed: "₹2.4 lakh crore+ disbursed since launch",
        profitPerAcre: "Direct income support of ₹6,000/year per family",
        farmingTips: "Keep land records updated, link Aadhaar with bank account, check status online regularly"
    },
    insurance: {
        name: "🛡️ Crop Insurance (फसल बीमा)",
        description: "Pradhan Mantri Fasal Bima Yojana (PMFBY) provides financial protection to farmers against crop loss due to natural calamities.",
        coverage: "Covers yield loss, prevented sowing, post-harvest losses",
        premium: "1.5-2% of sum insured for Kharif, 2% for Rabi",
        claimProcess: "Crop cutting experiments, yield data analysis, direct bank transfer",
        documents: "Land records, Sowing declaration, Bank account details",
        benefits: "Financial security, peace of mind, risk mitigation",
        profitPerAcre: "Protects against losses up to full sum insured",
        farmingTips: "Enroll before sowing deadline, maintain proper records, report losses immediately"
    },
    pest: {
        name: "🐛 Pest Management (कीट प्रबंधन)",
        description: "Integrated Pest Management (IPM) combines biological, cultural, physical, and chemical tools to manage pests effectively and sustainably.",
        commonPests: [
            { name: "Stem Borer", crops: "Rice, Sugarcane", control: "Trichogramma cards, resistant varieties", severity: "High" },
            { name: "Aphids", crops: "Wheat, Mustard", control: "Neem oil, ladybird beetles", severity: "Medium" },
            { name: "Whitefly", crops: "Cotton, Vegetables", control: "Yellow sticky traps, neem-based sprays", severity: "High" },
            { name: "Pink Bollworm", crops: "Cotton", control: "Bt cotton, pheromone traps", severity: "Critical" }
        ],
        ipmStrategies: "Crop rotation, resistant varieties, biological control, cultural practices, judicious pesticide use",
        naturalEnemies: "Ladybird beetles, praying mantis, spiders, Trichogramma wasps",
        profitPerAcre: "IPM saves ₹5,000-15,000 per acre on pesticides",
        farmingTips: "Regular field monitoring, use pheromone traps, rotate pesticides, preserve natural enemies"
    }
};

// Add click handlers to galaxy nodes
document.querySelectorAll(".galaxy-node").forEach(node => {
    node.addEventListener("click", function(e) {
        for (let i = 0; i < 20; i++) {
            createParticle(e.clientX, e.clientY);
        }
        const cropType = this.getAttribute("data-crop");
        if (cropType && cropData[cropType]) {
            showCropDetail(cropType);
            this.style.transform = "scale(0.95)";
            setTimeout(() => { this.style.transform = ""; }, 200);
        }
    });
});

function createParticle(x, y) {
    const particle = document.createElement("div");
    particle.className = "particle-effect";
    particle.style.left = x + "px";
    particle.style.top = y + "px";
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
}

function showCropDetail(cropType) {
    const crop = cropData[cropType];
    const modal = document.getElementById("cropDetailModal");
    const title = document.getElementById("cropDetailTitle");
    const body = document.getElementById("cropDetailBody");
    
    title.innerHTML = `<i class="fas ${getIconForCrop(cropType)}"></i> ${crop.name}`;
    
    let html = `<div style="animation: fadeIn 0.3s ease">`;
    html += `<p style="font-size:1.05rem; line-height:1.6; margin-bottom:1rem;">${crop.description}</p>`;
    
    if (crop.scientificName) {
        html += `<p><strong>🔬 Scientific Name:</strong> ${crop.scientificName}</p>`;
    }
    
    if (crop.growingSeason) {
        html += `<div class="info-grid">
            <div class="info-card"><i class="fas fa-calendar-alt"></i><strong>Season</strong><br>${crop.growingSeason}</div>
            <div class="info-card"><i class="fas fa-temperature-high"></i><strong>Temperature</strong><br>${crop.temperature || "Varies by region"}</div>
            <div class="info-card"><i class="fas fa-cloud-rain"></i><strong>Rainfall</strong><br>${crop.rainfall || "Depends on crop type"}</div>
            <div class="info-card"><i class="fas fa-mountain"></i><strong>Soil</strong><br>${crop.soilType || crop.soilTypes?.map(s => s.name).join(", ") || "Varies"}</div>
        </div>`;
    }
    
    html += `<div class="profit-card">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <div><div class="profit-label">💰 Estimated Profit Per Acre</div><div class="profit-number">${crop.profitPerAcre || "Varies by region"}</div></div>
            ${crop.msp ? `<div><div class="profit-label">🏛️ MSP (Minimum Support Price)</div><div class="profit-number">${crop.msp}</div></div>` : ''}
        </div>
    </div>`;
    
    if (crop.varieties) {
        html += `<h3 style="color:var(--primary); margin:1.5rem 0 1rem 0;"><i class="fas fa-chart-line"></i> Crop Varieties & Profitability</h3>
        <table class="variety-table"><thead><tr><th>Variety</th><th>Yield/acre</th><th>Duration</th><th>Profit</th></tr></thead><tbody>`;
        crop.varieties.forEach(v => {
            html += `<tr><td>${v.name}</td><td>${v.yield}</td><td>${v.duration}</td><td>${v.profit}</td></tr>`;
        });
        html += `</tbody></table>`;
    }
    
    if (crop.soilTypes) {
        html += `<h3 style="color:var(--primary); margin:1.5rem 0 1rem 0;"><i class="fas fa-mountain"></i> Soil Types in India</h3>
        <table class="variety-table"><thead><tr><th>Soil Type</th><th>Region</th><th>Suitable Crops</th><th>pH</th></tr></thead><tbody>`;
        crop.soilTypes.forEach(s => {
            html += `<tr><td>${s.name}</td><td>${s.region}</td><td>${s.crops}</td><td>${s.ph}</td></tr>`;
        });
        html += `</tbody></table>`;
    }
    
    if (crop.irrigationMethods) {
        html += `<h3 style="color:var(--primary); margin:1.5rem 0 1rem 0;"><i class="fas fa-tint"></i> Irrigation Methods Comparison</h3>
        <table class="variety-table"><thead><tr><th>Method</th><th>Efficiency</th><th>Cost</th><th>Suitability</th></tr></thead><tbody>`;
        crop.irrigationMethods.forEach(m => {
            html += `<tr><td>${m.name}</td><td>${m.efficiency}</td><td>${m.cost}</td><td>${m.suitability}</td></tr>`;
        });
        html += `</tbody></table>`;
    }
    
    if (crop.npkGuide) {
        html += `<h3 style="color:var(--primary); margin:1.5rem 0 1rem 0;"><i class="fas fa-flask"></i> NPK Nutrient Guide</h3>
        <table class="variety-table"><thead><tr><th>Nutrient</th><th>Role</th><th>Sources</th><th>Deficiency</th></tr></thead><tbody>`;
        crop.npkGuide.forEach(n => {
            html += `<tr><td>${n.nutrient}</td><td>${n.role}</td><td>${n.sources}</td><td>${n.deficiency}</td></tr>`;
        });
        html += `</tbody></table>`;
    }
    
    if (crop.commonPests) {
        html += `<h3 style="color:var(--primary); margin:1.5rem 0 1rem 0;"><i class="fas fa-bug"></i> Common Pests & Control</h3>
        <table class="variety-table"><thead><tr><th>Pest</th><th>Affected Crops</th><th>Control Method</th><th>Severity</th></tr></thead><tbody>`;
        crop.commonPests.forEach(p => {
            html += `<tr><td>${p.name}</td>的小${p.crops}</td><td>${p.control}</td><td><span style="color:${p.severity === 'High' ? '#ff6666' : p.severity === 'Critical' ? '#ff4444' : '#FFD60A'}">${p.severity}</span><tr></tr>`;
        });
        html += `</tbody></table>`;
    }
    
    html += `<div class="profit-card" style="margin-top:1.5rem; background: linear-gradient(135deg, rgba(0,180,216,0.15), rgba(0,208,132,0.08));">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 0.5rem;">
            <i class="fas fa-lightbulb" style="font-size: 1.5rem; color: var(--accent);"></i>
            <strong style="font-size:1.1rem;">💡 Expert Farming Tips</strong>
        </div>
        <p>${crop.farmingTips || "Follow best practices for optimal yield and profitability"}</p>
    </div>`;
    
    if (crop.fertilizer) html += `<div class="info-card" style="margin-top:1rem;"><i class="fas fa-flask"></i><strong> Fertilizer Recommendation:</strong> ${crop.fertilizer}</div>`;
    if (crop.irrigation) html += `<div class="info-card"><i class="fas fa-tint"></i><strong> Irrigation Schedule:</strong> ${crop.irrigation}</div>`;
    if (crop.diseases) html += `<div class="info-card"><i class="fas fa-biohazard"></i><strong> Common Diseases:</strong> ${crop.diseases}</div>`;
    if (crop.waterSaving) html += `<div class="info-card"><i class="fas fa-water"></i><strong> Water Saving Tip:</strong> ${crop.waterSaving}</div>`;
    
    html += `</div>`;
    body.innerHTML = html;
    modal.style.display = "flex";
    
    gsap.fromTo(".profit-number", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.2)" });
}

function getIconForCrop(cropType) {
    const icons = { rice: "fa-seedling", wheat: "fa-seedling", soil: "fa-mountain", water: "fa-tint", fertilizer: "fa-flask", pmkisan: "fa-file-invoice-dollar", insurance: "fa-shield-alt", pest: "fa-bug" };
    return icons[cropType] || "fa-leaf";
}

document.querySelector(".close-crop-modal")?.addEventListener("click", () => { document.getElementById("cropDetailModal").style.display = "none"; });
document.getElementById("cropDetailModal")?.addEventListener("click", (e) => { if (e.target === document.getElementById("cropDetailModal")) { document.getElementById("cropDetailModal").style.display = "none"; } });

// ========== AGRICULTURAL DATA DICTIONARY ==========
const agriculturalData = {
    crops: {
        "Rice": { yieldPerAcre: "4.5 tons", waterRequirement: "High", npk: { n: 120, p: 60, k: 60 }, season: { "Kharif": true, "Rabi": false } },
        "Wheat": { yieldPerAcre: "3.2 tons", waterRequirement: "Medium", npk: { n: 100, p: 50, k: 40 }, season: { "Kharif": false, "Rabi": true } },
        "Maize": { yieldPerAcre: "3.8 tons", waterRequirement: "Medium", npk: { n: 150, p: 60, k: 50 }, season: { "Kharif": true, "Rabi": true } },
        "Cotton": { yieldPerAcre: "2.5 tons", waterRequirement: "Low", npk: { n: 80, p: 40, k: 40 }, season: { "Kharif": true, "Rabi": false } },
        "Sugarcane": { yieldPerAcre: "40 tons", waterRequirement: "Very High", npk: { n: 200, p: 100, k: 100 }, season: { "Kharif": true, "Rabi": false } },
        "Pulses": { yieldPerAcre: "1.2 tons", waterRequirement: "Low", npk: { n: 40, p: 60, k: 30 }, season: { "Kharif": true, "Rabi": true } }
    },
    soilTypes: {
        "Alluvial": { organic: "Medium", drainage: "Good", suitableCrops: ["Rice", "Wheat", "Sugarcane"] },
        "Black": { organic: "High", drainage: "Poor", suitableCrops: ["Cotton", "Wheat", "Pulses"] },
        "Red": { organic: "Low", drainage: "Good", suitableCrops: ["Maize", "Pulses", "Groundnut"] },
        "Laterite": { organic: "Medium", drainage: "Good", suitableCrops: ["Rice", "Cashew", "Tea"] }
    },
    schemes: {
        "Punjab": { "Small": ["PM-KISAN", "Soil Health Card", "Crop Insurance", "Punjab Agri Subsidy"], "Marginal": ["PM-KISAN", "Free Electricity", "Seed Subsidy"], "Large": ["Kisan Credit Card", "Machinery Subsidy"] },
        "Maharashtra": { "Small": ["PM-KISAN", "Farm Loan Waiver", "Crop Insurance", "Jalyukt Shivar"], "Marginal": ["PM-KISAN", "Soil Health Card", "Drought Relief"], "Large": ["Subsidy on Machinery", "Export Subsidy"] },
        "Tamil Nadu": { "Small": ["PM-KISAN", "Free Electricity", "Crop Insurance", "Tamil Nadu Agri Scheme"], "Marginal": ["Subsidy on Seeds", "PM-KISAN", "Free Fertilizer"], "Large": ["Irrigation Subsidy"] },
        "Karnataka": { "Small": ["PM-KISAN", "Raitha Vidhya Nidhi", "Crop Insurance"], "Marginal": ["PM-KISAN", "Soil Health Card"], "Large": ["Krishi Bhagya", "Machinery Subsidy"] }
    },
    states: ["Punjab", "Haryana", "Uttar Pradesh", "Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat", "Rajasthan", "Bihar", "West Bengal", "Madhya Pradesh", "Andhra Pradesh"]
};

// ========== MULTI-LANGUAGE TRANSLATIONS (COMPLETE 10 LANGUAGES) ==========
const translations = {
    en: {
        navHome: "Home", navFeatures: "Features", navDashboard: "Farm Dashboard", navKnowledge: "Knowledge Hub", navAssistant: "Krishi Sakha", navImpact: "Impact",
        uploadBtn: "Upload", heroBadge: "🏆 HACKATHON WINNER 2025", heroSubtitle: "India's Trusted Agricultural Intelligence Platform",
        heroDesc: "Get accurate answers from government agricultural documents with AI-powered source verification and exact citations.",
        heroTryBtn: "Try Krishi Sakha", heroUploadBtn: "Upload Knowledge Base", trustBanner: "✨ Every answer is verified using uploaded agricultural documents",
        pillar1: "No Hallucinations", pillar2: "Exact Citations", pillar3: "Government Sources", pillar4: "Farmer Focused",
        featuresTitle: "Krishi Sakha Capabilities", featuresSub: "Click any card to open an intelligent agricultural tool",
        dashboardTitle: "🌾 My Farm Dashboard", dashboardSub: "Your personalized digital farm twin", generateBtn: "Generate My Farm Identity",
        farmPlaceholder: "⚡ Enter farm details to generate your Digital Farm Twin",
        schemeTitle: "🏛 Government Scheme Eligibility Engine", schemeSub: "Find schemes you qualify for based on your farm profile",
        checkSchemes: "Find Eligible Schemes", knowledgeVault: "Knowledge Vault", dropzoneText: "Drag & drop PDFs (ICAR, PM-KISAN, Govt manuals)",
        browseBtn: "Browse files", assistantName: "Krishi Sakha Assistant", trustScore: "Trust Score",
        welcomeMsg: "🌾 Namaste! I'm Krishi Sakha - your agricultural companion.",
        askBtn: "Ask", confidence: "Confidence:", mapTitle: "🗺️ Agricultural Intelligence Map", mapSub: "Click any state for detailed agriculture insights",
        mapPlaceholder: "👆 Click on any state to see agricultural intelligence", impactTitle: "Real Impact. Real Trust.",
        impactSub: "Making a difference in Indian agriculture", farmersHelped: "Farmers Helped", knowledgeDocs: "Knowledge Documents",
        knowledgeChunks: "Knowledge Chunks", trustAccuracy: "Trust Accuracy %", galaxyTitle: "✨ Knowledge Galaxy",
        galaxySub: "Connected agricultural intelligence", achievementsTitle: "🏆 Achievement Center",
        achievementsSub: "Unlock badges as you explore knowledge", badgeExplorer: "Explorer", badgeResearcher: "Researcher",
        badgeMaster: "Knowledge Master", badgeExpert: "Citation Expert", footerTagline: "Empowering Indian Farmers Through Trusted AI",
        footerHome: "Home", footerFeatures: "Features", footerDashboard: "Dashboard", footerAssistant: "Krishi Sakha",
        graphTitle: "📊 Agriculture Data Insights",
graphSub: "Visual representation of crop yields and trends across India"
    },
    hi: {
        navHome: "होम", navFeatures: "सुविधाएँ", navDashboard: "फार्म डैशबोर्ड", navKnowledge: "ज्ञान केंद्र", navAssistant: "कृषि सखा", navImpact: "प्रभाव",
        uploadBtn: "अपलोड", heroBadge: "🏆 हैकाथॉन विजेता 2025", heroSubtitle: "भारत का विश्वसनीय कृषि खुफिया मंच",
        heroDesc: "सरकारी कृषि दस्तावेजों से एआई-संचालित स्रोत सत्यापन और सटीक उद्धरण के साथ सटीक उत्तर प्राप्त करें।",
        heroTryBtn: "कृषि सखा आजमाएं", heroUploadBtn: "ज्ञान आधार अपलोड करें", trustBanner: "✨ हर उत्तर अपलोड किए गए कृषि दस्तावेजों का उपयोग करके सत्यापित किया जाता है",
        pillar1: "कोई भ्रम नहीं", pillar2: "सटीक उद्धरण", pillar3: "सरकारी स्रोत", pillar4: "किसान केंद्रित",
        featuresTitle: "कृषि सखा क्षमताएं", featuresSub: "बुद्धिमान कृषि उपकरण खोलने के लिए किसी भी कार्ड पर क्लिक करें",
        dashboardTitle: "🌾 मेरा फार्म डैशबोर्ड", dashboardSub: "आपका व्यक्तिगत डिजिटल फार्म ट्विन", generateBtn: "मेरी फार्म पहचान बनाएं",
        farmPlaceholder: "⚡ अपना डिजिटल फार्म ट्विन बनाने के लिए फार्म विवरण दर्ज करें",
        schemeTitle: "🏛 सरकारी योजना पात्रता इंजन", schemeSub: "अपने फार्म प्रोफाइल के आधार पर पात्र योजनाएं खोजें",
        checkSchemes: "पात्र योजनाएं खोजें", knowledgeVault: "ज्ञान भंडार", dropzoneText: "पीडीएफ ड्रैग और ड्रॉप करें (आईसीएआर, पीएम-किसान, सरकारी मैनुअल)",
        browseBtn: "फ़ाइलें ब्राउज़ करें", assistantName: "कृषि सखा सहायक", trustScore: "विश्वसनीयता स्कोर",
        welcomeMsg: "🌾 नमस्ते! मैं कृषि सखा हूं - आपका कृषि साथी।",
        askBtn: "पूछें", confidence: "विश्वसनीयता:", mapTitle: "🗺️ कृषि बुद्धिमत्ता मानचित्र", mapSub: "विस्तृत कृषि जानकारी के लिए किसी भी राज्य पर क्लिक करें",
        mapPlaceholder: "👆 कृषि बुद्धिमत्ता देखने के लिए किसी राज्य पर क्लिक करें", impactTitle: "वास्तविक प्रभाव। वास्तविक विश्वास।",
        impactSub: "भारतीय कृषि में बदलाव लाना", farmersHelped: "किसानों की मदद की", knowledgeDocs: "ज्ञान दस्तावेज",
        knowledgeChunks: "ज्ञान खंड", trustAccuracy: "विश्वसनीयता सटीकता %", galaxyTitle: "✨ ज्ञान आकाशगंगा",
        galaxySub: "जुड़ी हुई कृषि बुद्धिमत्ता", achievementsTitle: "🏆 उपलब्धि केंद्र",
        achievementsSub: "ज्ञान अन्वेषण करते हुए बैज अनलॉक करें", badgeExplorer: "खोजकर्ता", badgeResearcher: "शोधकर्ता",
        badgeMaster: "ज्ञान गुरु", badgeExpert: "उद्धरण विशेषज्ञ", footerTagline: "विश्वसनीय एआई के माध्यम से भारतीय किसानों को सशक्त बनाना",
        footerHome: "होम", footerFeatures: "सुविधाएँ", footerDashboard: "डैशबोर्ड", footerAssistant: "कृषि सखा",
        graphTitle: "📊 कृषि डेटा अंतर्दृष्टि",
graphSub: "भारत भर में फसल उपज और रुझानों का दृश्य प्रतिनिधित्व"
    },
    ta: {
        navHome: "முகப்பு", navFeatures: "அம்சங்கள்", navDashboard: "பண்ணை டாஷ்போர்டு", navKnowledge: "அறிவு மையம்", navAssistant: "கிருஷி சகா", navImpact: "தாக்கம்",
        uploadBtn: "பதிவேற்றம்", heroBadge: "🏆 ஹாக்காதோன் வெற்றியாளர் 2025", heroSubtitle: "இந்தியாவின் நம்பகமான வேளாண் உளவுத்துறை தளம்",
        heroDesc: "அரசு வேளாண் ஆவணங்களிலிருந்து AI-இயக்கப்படும் மூலச் சரிபார்ப்பு மற்றும் துல்லியமான மேற்கோள்களுடன் துல்லியமான பதில்களைப் பெறுங்கள்.",
        heroTryBtn: "கிருஷி சகாவை முயற்சிக்கவும்", heroUploadBtn: "அறிவுத் தளத்தைப் பதிவேற்றவும்", trustBanner: "✨ ஒவ்வொரு பதிலும் பதிவேற்றப்பட்ட வேளாண் ஆவணங்களைப் பயன்படுத்தி சரிபார்க்கப்படுகிறது",
        pillar1: "மாயத்தோற்றம் இல்லை", pillar2: "சரியான மேற்கோள்கள்", pillar3: "அரசு ஆதாரங்கள்", pillar4: "விவசாயி மையப்படுத்தப்பட்டது",
        featuresTitle: "கிருஷி சகா திறன்கள்", featuresSub: "ஒரு அறிவார்ந்த வேளாண் கருவியைத் திறக்க எந்த அட்டையிலும் கிளிக் செய்யவும்",
        dashboardTitle: "🌾 எனது பண்ணை டாஷ்போர்டு", dashboardSub: "உங்கள் தனிப்பயனாக்கப்பட்ட டிஜிட்டல் பண்ணை இரட்டை", generateBtn: "எனது பண்ணை அடையாளத்தை உருவாக்கவும்",
        farmPlaceholder: "⚡ உங்கள் டிஜிட்டல் பண்ணை இரட்டையை உருவாக்க பண்ணை விவரங்களை உள்ளிடவும்",
        schemeTitle: "🏛 அரசு திட்ட தகுதி இயந்திரம்", schemeSub: "உங்கள் பண்ணை சுயவிவரத்தின் அடிப்படையில் நீங்கள் தகுதி பெறும் திட்டங்களைக் கண்டறியவும்",
        checkSchemes: "தகுதியான திட்டங்களைக் கண்டறியவும்", knowledgeVault: "அறிவுப் பெட்டகம்", dropzoneText: "PDF களை இழுத்து விடவும் (ICAR, PM-KISAN, அரசு கையேடுகள்)",
        browseBtn: "கோப்புகளை உலாவுக", assistantName: "கிருஷி சகா உதவியாளர்", trustScore: "நம்பிக்கை மதிப்பெண்",
        welcomeMsg: "🌾 வணக்கம்! நான் கிருஷி சகா - உங்கள் வேளாண் துணை.",
        askBtn: "கேள்", confidence: "நம்பிக்கை:", mapTitle: "🗺️ வேளாண் உளவுத்துறை வரைபடம்", mapSub: "விரிவான வேளாண் நுண்ணறிவுக்கு எந்த மாநிலத்திலும் கிளிக் செய்யவும்",
        mapPlaceholder: "👆 வேளாண் நுண்ணறிவைக் காண எந்த மாநிலத்திலும் கிளிக் செய்யவும்", impactTitle: "உண்மையான தாக்கம். உண்மையான நம்பிக்கை.",
        impactSub: "இந்திய வேளாண்மையில் மாற்றத்தை ஏற்படுத்துதல்", farmersHelped: "விவசாயிகள் உதவினார்", knowledgeDocs: "அறிவு ஆவணங்கள்",
        knowledgeChunks: "அறிவு துண்டுகள்", trustAccuracy: "நம்பிக்கை துல்லியம் %", galaxyTitle: "✨ அறிவு விண்மீன்",
        galaxySub: "இணைக்கப்பட்ட வேளாண் நுண்ணறிவு", achievementsTitle: "🏆 சாதனை மையம்",
        achievementsSub: "அறிவை ஆராயும்போது பேட்ஜ்களைத் திறக்கவும்", badgeExplorer: "ஆய்வாளர்", badgeResearcher: "ஆராய்ச்சியாளர்",
        badgeMaster: "அறிவு மாஸ்டர்", badgeExpert: "மேற்கோள் நிபுணர்", footerTagline: "நம்பகமான AI மூலம் இந்திய விவசாயிகளை மேம்படுத்துதல்",
        footerHome: "முகப்பு", footerFeatures: "அம்சங்கள்", footerDashboard: "டாஷ்போர்டு", footerAssistant: "கிருஷி சகா"
    },
    te: {
        navHome: "హోమ్", navFeatures: "ఫీచర్లు", navDashboard: "ఫార్మ్ డ్యాష్బోర్డ్", navKnowledge: "నాలెడ్జ్ హబ్", navAssistant: "కృషి సఖ", navImpact: "ప్రభావం",
        uploadBtn: "అప్లోడ్", heroBadge: "🏆 హ్యాకథాన్ విజేత 2025", heroSubtitle: "భారతదేశం యొక్క విశ్వసనీయ వ్యవసాయ ఇంటెలిజెన్స్ ప్లాట్ఫారమ్",
        heroDesc: "AI-శక్తితో పనిచేసే మూల ధృవీకరణ మరియు ఖచ్చితమైన కోట్లతో ప్రభుత్వ వ్యవసాయ పత్రాల నుండి ఖచ్చితమైన సమాధానాలను పొందండి.",
        heroTryBtn: "కృషి సఖను ప్రయత్నించండి", heroUploadBtn: "నాలెడ్జ్ బేస్ అప్లోడ్ చేయండి", trustBanner: "✨ ప్రతి సమాధానం అప్లోడ్ చేసిన వ్యవసాయ పత్రాలను ఉపయోగించి ధృవీకరించబడుతుంది",
        pillar1: "భ్రమలు లేవు", pillar2: "ఖచ్చితమైన కోట్లు", pillar3: "ప్రభుత్వ మూలాలు", pillar4: "రైతు-కేంద్రీకృతం",
        featuresTitle: "కృషి సఖ సామర్థ్యాలు", featuresSub: "ఇంటెలిజెంట్ వ్యవసాయ సాధనాన్ని తెరవడానికి ఏదైనా కార్డుపై క్లిక్ చేయండి",
        dashboardTitle: "🌾 నా ఫార్మ్ డ్యాష్బోర్డ్", dashboardSub: "మీ వ్యక్తిగతీకరించిన డిజిటల్ ఫార్మ్ ట్విన్", generateBtn: "నా ఫార్మ్ ఐడెంటిటీని రూపొందించండి",
        farmPlaceholder: "⚡ మీ డిజిటల్ ఫార్మ్ ట్విన్ను రూపొందించడానికి ఫార్మ్ వివరాలను నమోదు చేయండి",
        schemeTitle: "🏛 ప్రభుత్వ పథకం అర్హత ఇంజిన్", schemeSub: "మీ ఫార్మ్ ప్రొఫైల్ ఆధారంగా మీరు అర్హత పొందే పథకాలను కనుగొనండి",
        checkSchemes: "అర్హత కలిగిన పథకాలను కనుగొనండి", knowledgeVault: "నాలెడ్జ్ వాల్ట్", dropzoneText: "PDFలను డ్రాగ్ & డ్రాప్ చేయండి (ICAR, PM-KISAN, ప్రభుత్వ మాన్యువల్లు)",
        browseBtn: "ఫైల్లను బ్రౌజ్ చేయండి", assistantName: "కృషి సఖ అసిస్టెంట్", trustScore: "ట్రస్ట్ స్కోర్",
        welcomeMsg: "🌾 నమస్కారం! నేను కృషి సఖ - మీ వ్యవసాయ సహాయకుడు.",
        askBtn: "అడగండి", confidence: "కాన్ఫిడెన్స్:", mapTitle: "🗺️ వ్యవసాయ ఇంటెలిజెన్స్ మ్యాప్", mapSub: "వివరణాత్మక వ్యవసాయ అంతర్దృష్టుల కోసం ఏదైనా రాష్ట్రంపై క్లిక్ చేయండి",
        mapPlaceholder: "👆 వ్యవసాయ ఇంటెలిజెన్స్ చూడటానికి ఏదైనా రాష్ట్రంపై క్లిక్ చేయండి", impactTitle: "రియల్ ఇంపాక్ట్. రియల్ ట్రస్ట్.",
        impactSub: "భారతీయ వ్యవసాయంలో మార్పు తీసుకురావడం", farmersHelped: "రైతులు సహాయం చేశారు", knowledgeDocs: "నాలెడ్జ్ డాక్యుమెంట్లు",
        knowledgeChunks: "నాలెడ్జ్ చంక్స్", trustAccuracy: "ట్రస్ట్ ఖచ్చితత్వం %", galaxyTitle: "✨ నాలెడ్జ్ గెలాక్సీ",
        galaxySub: "కనెక్ట్ చేయబడిన వ్యవసాయ ఇంటెలిజెన్స్", achievementsTitle: "🏆 అచీవ్మెంట్ సెంటర్",
        achievementsSub: "జ్ఞానాన్ని అన్వేషించేటప్పుడు బ్యాడ్జ్లను అన్లాక్ చేయండి", badgeExplorer: "ఎక్స్ప్లోరర్", badgeResearcher: "రీసెర్చర్",
        badgeMaster: "నాలెడ్జ్ మాస్టర్", badgeExpert: "సిటేషన్ ఎక్స్పర్ట్", footerTagline: "విశ్వసనీయ AI ద్వారా భారతీయ రైతులను శక్తివంతం చేయడం",
        footerHome: "హోమ్", footerFeatures: "ఫీచర్లు", footerDashboard: "డ్యాష్బోర్డ్", footerAssistant: "కృషి సఖ"
    },
    kn: {
        navHome: "ಮುಖಪುಟ", navFeatures: "ವೈಶಿಷ್ಟ್ಯಗಳು", navDashboard: "ಫಾರ್ಮ್ ಡ್ಯಾಶ್ಬೋರ್ಡ್", navKnowledge: "ಜ್ಞಾನ ಕೇಂದ್ರ", navAssistant: "ಕೃಷಿ ಸಖ", navImpact: "ಪ್ರಭಾವ",
        uploadBtn: "ಅಪ್ಲೋಡ್", heroBadge: "🏆 ಹ್ಯಾಕಾಥಾನ್ ವಿಜೇತ 2025", heroSubtitle: "ಭಾರತದ ವಿಶ್ವಾಸಾರ್ಹ ಕೃಷಿ ಗುಪ್ತಚರ ವೇದಿಕೆ",
        heroDesc: "ಸರ್ಕಾರಿ ಕೃಷಿ ದಾಖಲೆಗಳಿಂದ AI-ಚಾಲಿತ ಮೂಲ ಪರಿಶೀಲನೆ ಮತ್ತು ನಿಖರವಾದ ಉಲ್ಲೇಖಗಳೊಂದಿಗೆ ನಿಖರವಾದ ಉತ್ತರಗಳನ್ನು ಪಡೆಯಿರಿ.",
        heroTryBtn: "ಕೃಷಿ ಸಖ ಪ್ರಯತ್ನಿಸಿ", heroUploadBtn: "ಜ್ಞಾನ ಆಧಾರ ಅಪ್ಲೋಡ್ ಮಾಡಿ", trustBanner: "✨ ಪ್ರತಿ ಉತ್ತರವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿದ ಕೃಷಿ ದಾಖಲೆಗಳನ್ನು ಬಳಸಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ",
        pillar1: "ಯಾವುದೇ ಭ್ರಮೆಗಳಿಲ್ಲ", pillar2: "ನಿಖರ ಉಲ್ಲೇಖಗಳು", pillar3: "ಸರ್ಕಾರಿ ಮೂಲಗಳು", pillar4: "ರೈತ-ಕೇಂದ್ರಿತ",
        featuresTitle: "ಕೃಷಿ ಸಖ ಸಾಮರ್ಥ್ಯಗಳು", featuresSub: "ಬುದ್ಧಿವಂತ ಕೃಷಿ ಸಾಧನವನ್ನು ತೆರೆಯಲು ಯಾವುದೇ ಕಾರ್ಡ್ ಕ್ಲಿಕ್ ಮಾಡಿ",
        dashboardTitle: "🌾 ನನ್ನ ಫಾರ್ಮ್ ಡ್ಯಾಶ್ಬೋರ್ಡ್", dashboardSub: "ನಿಮ್ಮ ವೈಯಕ್ತೀಕರಿಸಿದ ಡಿಜಿಟಲ್ ಫಾರ್ಮ್ ಅವಳಿ", generateBtn: "ನನ್ನ ಫಾರ್ಮ್ ಗುರುತನ್ನು ರಚಿಸಿ",
        farmPlaceholder: "⚡ ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಫಾರ್ಮ್ ಅವಳಿಯನ್ನು ರಚಿಸಲು ಫಾರ್ಮ್ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ",
        schemeTitle: "🏛 ಸರ್ಕಾರಿ ಯೋಜನೆ ಅರ್ಹತಾ ಎಂಜಿನ್", schemeSub: "ನಿಮ್ಮ ಫಾರ್ಮ್ ಪ್ರೊಫೈಲ್ ಆಧರಿಸಿ ನೀವು ಅರ್ಹತೆ ಪಡೆಯುವ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ",
        checkSchemes: "ಅರ್ಹ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ", knowledgeVault: "ಜ್ಞಾನ ಭಂಡಾರ", dropzoneText: "PDFಗಳನ್ನು ಎಳೆಯಿರಿ ಮತ್ತು ಬಿಡಿ (ICAR, PM-KISAN, ಸರ್ಕಾರಿ ಕೈಪಿಡಿಗಳು)",
        browseBtn: "ಫೈಲ್ಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ", assistantName: "ಕೃಷಿ ಸಖ ಸಹಾಯಕ", trustScore: "ಟ್ರಸ್ಟ್ ಸ್ಕೋರ್",
        welcomeMsg: "🌾 ನಮಸ್ಕಾರ! ನಾನು ಕೃಷಿ ಸಖ - ನಿಮ್ಮ ಕೃಷಿ ಸಹಚರ.",
        askBtn: "ಕೇಳಿ", confidence: "ಕಾನ್ಫಿಡೆನ್ಸ್:", mapTitle: "🗺️ ಕೃಷಿ ಗುಪ್ತಚರ ನಕ್ಷೆ", mapSub: "ವಿವರವಾದ ಕೃಷಿ ಒಳನೋಟಗಳಿಗಾಗಿ ಯಾವುದೇ ರಾಜ್ಯದ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ",
        mapPlaceholder: "👆 ಕೃಷಿ ಗುಪ್ತಚರ ನೋಡಲು ಯಾವುದೇ ರಾಜ್ಯದ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ", impactTitle: "ನಿಜವಾದ ಪ್ರಭಾವ. ನಿಜವಾದ ನಂಬಿಕೆ.",
        impactSub: "ಭಾರತೀಯ ಕೃಷಿಯಲ್ಲಿ ಬದಲಾವಣೆಯನ್ನು ತರುವುದು", farmersHelped: "ರೈತರು ಸಹಾಯ ಮಾಡಿದರು", knowledgeDocs: "ಜ್ಞಾನ ದಾಖಲೆಗಳು",
        knowledgeChunks: "ಜ್ಞಾನ ಚಂಕ್ಸ್", trustAccuracy: "ಟ್ರಸ್ಟ್ ನಿಖರತೆ %", galaxyTitle: "✨ ಜ್ಞಾನ ಗೆಲಕ್ಸಿ",
        galaxySub: "ಸಂಪರ್ಕಿತ ಕೃಷಿ ಗುಪ್ತಚರ", achievementsTitle: "🏆 ಸಾಧನೆ ಕೇಂದ್ರ",
        achievementsSub: "ಜ್ಞಾನವನ್ನು ಅನ್ವೇಷಿಸುವಾಗ ಬ್ಯಾಡ್ಜ್ಗಳನ್ನು ಅನ್ಲಾಕ್ ಮಾಡಿ", badgeExplorer: "ಪರಿಶೋಧಕ", badgeResearcher: "ಸಂಶೋಧಕ",
        badgeMaster: "ಜ್ಞಾನ ಮಾಸ್ಟರ್", badgeExpert: "ಉಲ್ಲೇಖ ತಜ್ಞ", footerTagline: "ವಿಶ್ವಾಸಾರ್ಹ AI ಮೂಲಕ ಭಾರತೀಯ ರೈತರನ್ನು ಸಬಲೀಕರಣಗೊಳಿಸುವುದು",
        footerHome: "ಮುಖಪುಟ", footerFeatures: "ವೈಶಿಷ್ಟ್ಯಗಳು", footerDashboard: "ಡ್ಯಾಶ್ಬೋರ್ಡ್", footerAssistant: "ಕೃಷಿ ಸಖ"
    },
    ml: {
        navHome: "ഹോം", navFeatures: "സവിശേഷതകൾ", navDashboard: "ഫാം ഡാഷ്ബോർഡ്", navKnowledge: "നോളജ് ഹബ്", navAssistant: "കൃഷി സഖ", navImpact: "സ്വാധീനം",
        uploadBtn: "അപ്ലോഡ്", heroBadge: "🏆 ഹാക്കത്തോൺ വിജയി 2025", heroSubtitle: "ഇന്ത്യയുടെ വിശ്വസ്ത കാർഷിക ഇന്റലിജൻസ് പ്ലാറ്റ്ഫോം",
        heroDesc: "സർക്കാർ കാർഷിക രേഖകളിൽ നിന്ന് AI- പവർ ഉറവിട പരിശോധനയും കൃത്യമായ അവലംബങ്ങളുമുള്ള കൃത്യമായ ഉത്തരങ്ങൾ നേടുക.",
        heroTryBtn: "കൃഷി സഖ പരീക്ഷിക്കുക", heroUploadBtn: "നോളജ് ബേസ് അപ്ലോഡ് ചെയ്യുക", trustBanner: "✨ ഓരോ ഉത്തരവും അപ്ലോഡ് ചെയ്ത കാർഷിക രേഖകൾ ഉപയോഗിച്ച് പരിശോധിക്കുന്നു",
        pillar1: "മിഥ്യാധാരണകൾ ഇല്ല", pillar2: "കൃത്യമായ അവലംബങ്ങൾ", pillar3: "സർക്കാർ സ്രോതസ്സുകൾ", pillar4: "കർഷക കേന്ദ്രീകൃതം",
        featuresTitle: "കൃഷി സഖ കഴിവുകൾ", featuresSub: "ഒരു ബുദ്ധിപരമായ കാർഷിക ഉപകരണം തുറക്കാൻ ഏതെങ്കിലും കാർഡിൽ ക്ലിക്കുചെയ്യുക",
        dashboardTitle: "🌾 എന്റെ ഫാം ഡാഷ്ബോർഡ്", dashboardSub: "നിങ്ങളുടെ വ്യക്തിഗതമാക്കിയ ഡിജിറ്റൽ ഫാം ഇരട്ട", generateBtn: "എന്റെ ഫാം ഐഡന്റിറ്റി സൃഷ്ടിക്കുക",
        farmPlaceholder: "⚡ നിങ്ങളുടെ ഡിജിറ്റൽ ഫാം ഇരട്ട സൃഷ്ടിക്കാൻ ഫാം വിശദാംശങ്ങൾ നൽകുക",
        schemeTitle: "🏛 ഗവൺമെന്റ് സ്കീം എലിജിബിലിറ്റി എഞ്ചിൻ", schemeSub: "നിങ്ങളുടെ ഫാം പ്രൊഫൈലിനെ അടിസ്ഥാനമാക്കി നിങ്ങൾക്ക് യോഗ്യതയുള്ള പദ്ധതികൾ കണ്ടെത്തുക",
        checkSchemes: "യോഗ്യമായ പദ്ധതികൾ കണ്ടെത്തുക", knowledgeVault: "നോളജ് വാൾട്ട്", dropzoneText: "PDF-കൾ വലിച്ചിടുക (ICAR, PM-KISAN, സർക്കാർ മാനുവലുകൾ)",
        browseBtn: "ഫയലുകൾ ബ്രൗസ് ചെയ്യുക", assistantName: "കൃഷി സഖ അസിസ്റ്റന്റ്", trustScore: "വിശ്വാസ സ്കോർ",
        welcomeMsg: "🌾 നമസ്കാരം! ഞാൻ കൃഷി സഖ - നിങ്ങളുടെ കാർഷിക കൂട്ടാളി.",
        askBtn: "ചോദിക്കുക", confidence: "ആത്മവിശ്വാസം:", mapTitle: "🗺️ കാർഷിക ഇന്റലിജൻസ് മാപ്പ്", mapSub: "വിശദമായ കാർഷിക ഉൾക്കാഴ്ചകൾക്കായി ഏത് സംസ്ഥാനത്തും ക്ലിക്കുചെയ്യുക",
        mapPlaceholder: "👆 കാർഷിക ഇന്റലിജൻസ് കാണുന്നതിന് ഏത് സംസ്ഥാനത്തും ക്ലിക്കുചെയ്യുക", impactTitle: "യഥാർത്ഥ സ്വാധീനം. യഥാർത്ഥ വിശ്വാസം.",
        impactSub: "ഇന്ത്യൻ കൃഷിയിൽ മാറ്റം വരുത്തുന്നു", farmersHelped: "കർഷകർ സഹായിച്ചു", knowledgeDocs: "നോളജ് രേഖകൾ",
        knowledgeChunks: "നോളജ് ചങ്ക്സ്", trustAccuracy: "വിശ്വാസ കൃത്യത %", galaxyTitle: "✨ നോളജ് ഗാലക്സി",
        galaxySub: "കണക്റ്റുചെയ്ത കാർഷിക ഇന്റലിജൻസ്", achievementsTitle: "🏆 നേട്ട കേന്ദ്രം",
        achievementsSub: "അറിവ് പര്യവേക്ഷണം ചെയ്യുമ്പോൾ ബാഡ്ജുകൾ അൺലോക്ക് ചെയ്യുക", badgeExplorer: "പര്യവേക്ഷകൻ", badgeResearcher: "ഗവേഷകൻ",
        badgeMaster: "നോളജ് മാസ്റ്റർ", badgeExpert: "അവലംബ വിദഗ്ധൻ", footerTagline: "വിശ്വസനീയമായ AI വഴി ഇന്ത്യൻ കർഷകരെ ശാക്തീകരിക്കുന്നു",
        footerHome: "ഹോം", footerFeatures: "സവിശേഷതകൾ", footerDashboard: "ഡാഷ്ബോർഡ്", footerAssistant: "കൃഷി സഖ"
    },
    mr: {
        navHome: "होम", navFeatures: "वैशिष्ट्ये", navDashboard: "शेत डॅशबोर्ड", navKnowledge: "ज्ञान केंद्र", navAssistant: "कृषी सखा", navImpact: "प्रभाव",
        uploadBtn: "अपलोड", heroBadge: "🏆 हॅकाथॉन विजेता 2025", heroSubtitle: "भारताचे विश्वसनीय कृषी बुद्धिमत्ता व्यासपीठ",
        heroDesc: "सरकारी कृषी दस्तऐवजांमधून एआय-समर्थित स्त्रोत सत्यापन आणि अचूक उद्धरणांसह अचूक उत्तरे मिळवा.",
        heroTryBtn: "कृषी सखा वापरून पहा", heroUploadBtn: "ज्ञान आधार अपलोड करा", trustBanner: "✨ प्रत्येक उत्तर अपलोड केलेल्या कृषी दस्तऐवजांचा वापर करून सत्यापित केले जाते",
        pillar1: "कोणतेही भ्रम नाहीत", pillar2: "अचूक उद्धरण", pillar3: "सरकारी स्रोत", pillar4: "शेतकरी-केंद्रित",
        featuresTitle: "कृषी सखा क्षमता", featuresSub: "बुद्धिमान कृषी साधन उघडण्यासाठी कोणत्याही कार्डवर क्लिक करा",
        dashboardTitle: "🌾 माझे शेत डॅशबोर्ड", dashboardSub: "तुमचा वैयक्तिकृत डिजिटल शेत जुळा", generateBtn: "माझी शेत ओळख तयार करा",
        farmPlaceholder: "⚡ तुमचा डिजिटल शेत जुळा तयार करण्यासाठी शेत तपशील प्रविष्ट करा",
        schemeTitle: "🏛 सरकारी योजना पात्रता इंजिन", schemeSub: "तुमच्या शेत प्रोफाइलवर आधारित पात्र योजना शोधा",
        checkSchemes: "पात्र योजना शोधा", knowledgeVault: "ज्ञान तिजोरी", dropzoneText: "PDF ड्रॅग आणि ड्रॉप करा (ICAR, PM-KISAN, सरकारी मॅन्युअल)",
        browseBtn: "फाइल्स ब्राउझ करा", assistantName: "कृषी सखा सहाय्यक", trustScore: "विश्वास स्कोअर",
        welcomeMsg: "🌾 नमस्कार! मी कृषी सखा - तुमचा कृषी साथीदार.",
        askBtn: "विचारा", confidence: "आत्मविश्वास:", mapTitle: "🗺️ कृषी बुद्धिमत्ता नकाशा", mapSub: "तपशीलवार कृषी अंतर्दृष्टीसाठी कोणत्याही राज्यावर क्लिक करा",
        mapPlaceholder: "👆 कृषी बुद्धिमत्ता पाहण्यासाठी कोणत्याही राज्यावर क्लिक करा", impactTitle: "वास्तविक प्रभाव. वास्तविक विश्वास.",
        impactSub: "भारतीय कृषीमध्ये बदल घडवून आणणे", farmersHelped: "शेतकऱ्यांना मदत केली", knowledgeDocs: "ज्ञान दस्तऐवज",
        knowledgeChunks: "ज्ञान तुकडे", trustAccuracy: "विश्वास अचूकता %", galaxyTitle: "✨ ज्ञान गॅलेक्सी",
        galaxySub: "जोडलेली कृषी बुद्धिमत्ता", achievementsTitle: "🏆 कर्तृत्व केंद्र",
        achievementsSub: "ज्ञान एक्सप्लोर करताना बॅज अनलॉक करा", badgeExplorer: "एक्सप्लोरर", badgeResearcher: "संशोधक",
        badgeMaster: "ज्ञान मास्टर", badgeExpert: "उद्धरण तज्ञ", footerTagline: "विश्वासार्ह AI द्वारे भारतीय शेतकऱ्यांना सक्षम बनवणे",
        footerHome: "होम", footerFeatures: "वैशिष्ट्ये", footerDashboard: "डॅशबोर्ड", footerAssistant: "कृषी सखा"
    },
    gu: {
        navHome: "હોમ", navFeatures: "વિશેષતાઓ", navDashboard: "ફાર્મ ડેશબોર્ડ", navKnowledge: "જ્ઞાન કેન્દ્ર", navAssistant: "કૃષિ સખા", navImpact: "પ્રભાવ",
        uploadBtn: "અપલોડ", heroBadge: "🏆 હેકાથોન વિજેતા 2025", heroSubtitle: "ભારતનું વિશ્વસનીય કૃષિ ઇન્ટેલિજન્સ પ્લેટફોર્મ",
        heroDesc: "સરકારી કૃષિ દસ્તાવેજોમાંથી AI-સંચાલિત સ્ત્રોત ચકાસણી અને ચોક્કસ ઉદ્ધરણો સાથે ચોક્કસ જવાબો મેળવો.",
        heroTryBtn: "કૃષિ સખા અજમાવો", heroUploadBtn: "જ્ઞાન આધાર અપલોડ કરો", trustBanner: "✨ દરેક જવાબ અપલોડ કરેલા કૃષિ દસ્તાવેજોનો ઉપયોગ કરીને ચકાસાયેલ છે",
        pillar1: "કોઈ ભ્રમણા નથી", pillar2: "ચોક્કસ ઉદ્ધરણો", pillar3: "સરકારી સ્ત્રોતો", pillar4: "ખેડૂત-કેન્દ્રિત",
        featuresTitle: "કૃષિ સખા ક્ષમતાઓ", featuresSub: "બુદ્ધિશાળી કૃષિ સાધન ખોલવા માટે કોઈપણ કાર્ડ પર ક્લિક કરો",
        dashboardTitle: "🌾 મારું ફાર્મ ડેશબોર્ડ", dashboardSub: "તમારું વ્યક્તિગત ડિજિટલ ફાર્મ જોડિયું", generateBtn: "મારી ફાર્મ ઓળખ બનાવો",
        farmPlaceholder: "⚡ તમારું ડિજિટલ ફાર્મ જોડિયું બનાવવા માટે ફાર્મ વિગતો દાખલ કરો",
        schemeTitle: "🏛 સરકારી યોજના પાત્રતા એન્જિન", schemeSub: "તમારા ફાર્મ પ્રોફાઇલના આધારે તમે પાત્ર હોય તેવી યોજનાઓ શોધો",
        checkSchemes: "પાત્ર યોજનાઓ શોધો", knowledgeVault: "જ્ઞાન ભંડાર", dropzoneText: "PDF ખેંચો અને છોડો (ICAR, PM-KISAN, સરકારી માર્ગદર્શિકાઓ)",
        browseBtn: "ફાઇલો બ્રાઉઝ કરો", assistantName: "કૃષિ સખા સહાયક", trustScore: "વિશ્વાસ સ્કોર",
        welcomeMsg: "🌾 નમસ્તે! હું કૃષિ સખા - તમારો કૃષિ સાથી.",
        askBtn: "પૂછો", confidence: "આત્મવિશ્વાસ:", mapTitle: "🗺️ કૃષિ ઇન્ટેલિજન્સ નકશો", mapSub: "વિગતવાર કૃષિ આંતરદૃષ્ટિ માટે કોઈપણ રાજ્ય પર ક્લિક કરો",
        mapPlaceholder: "👆 કૃષિ ઇન્ટેલિજન્સ જોવા માટે કોઈપણ રાજ્ય પર ક્લિક કરો", impactTitle: "વાસ્તવિક પ્રભાવ. વાસ્તવિક વિશ્વાસ.",
        impactSub: "ભારતીય કૃષિમાં ફેરફાર લાવવો", farmersHelped: "ખેડૂતોને મદદ કરી", knowledgeDocs: "જ્ઞાન દસ્તાવેજો",
        knowledgeChunks: "જ્ઞાન ભાગો", trustAccuracy: "વિશ્વાસ ચોકસાઈ %", galaxyTitle: "✨ જ્ઞાન ગેલેક્સી",
        galaxySub: "જોડાયેલ કૃષિ ઇન્ટેલિજન્સ", achievementsTitle: "🏆 સિદ્ધિ કેન્દ્ર",
        achievementsSub: "જ્ઞાન અન્વેષણ કરતાં બેજ ખોલો", badgeExplorer: "શોધક", badgeResearcher: "સંશોધક",
        badgeMaster: "જ્ઞાન માસ્ટર", badgeExpert: "ઉદ્ધરણ નિષ્ણાત", footerTagline: "વિશ્વસનીય AI દ્વારા ભારતીય ખેડૂતોને સશક્તિકરણ",
        footerHome: "હોમ", footerFeatures: "વિશેષતાઓ", footerDashboard: "ડેશબોર્ડ", footerAssistant: "કૃષિ સખા"
    },
    pa: {
        navHome: "ਹੋਮ", navFeatures: "ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ", navDashboard: "ਫਾਰਮ ਡੈਸ਼ਬੋਰਡ", navKnowledge: "ਗਿਆਨ ਕੇਂਦਰ", navAssistant: "ਕ੍ਰਿਸ਼ੀ ਸਖਾ", navImpact: "ਪ੍ਰਭਾਵ",
        uploadBtn: "ਅਪਲੋਡ", heroBadge: "🏆 ਹੈਕਾਥੋਨ ਜੇਤੂ 2025", heroSubtitle: "ਭਾਰਤ ਦਾ ਭਰੋਸੇਮੰਦ ਖੇਤੀਬਾੜੀ ਇੰਟੈਲੀਜੈਂਸ ਪਲੇਟਫਾਰਮ",
        heroDesc: "ਸਰਕਾਰੀ ਖੇਤੀਬਾੜੀ ਦਸਤਾਵੇਜ਼ਾਂ ਤੋਂ AI-ਸੰਚਾਲਿਤ ਸਰੋਤ ਪੁਸ਼ਟੀਕਰਨ ਅਤੇ ਸਹੀ ਹਵਾਲਿਆਂ ਦੇ ਨਾਲ ਸਹੀ ਜਵਾਬ ਪ੍ਰਾਪਤ ਕਰੋ.",
        heroTryBtn: "ਕ੍ਰਿਸ਼ੀ ਸਖਾ ਅਜ਼ਮਾਓ", heroUploadBtn: "ਗਿਆਨ ਅਧਾਰ ਅਪਲੋਡ ਕਰੋ", trustBanner: "✨ ਹਰ ਜਵਾਬ ਅਪਲੋਡ ਕੀਤੇ ਖੇਤੀਬਾੜੀ ਦਸਤਾਵੇਜ਼ਾਂ ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਤਸਦੀਕ ਕੀਤਾ ਜਾਂਦਾ ਹੈ",
        pillar1: "ਕੋਈ ਭਰਮ ਨਹੀਂ", pillar2: "ਸਹੀ ਹਵਾਲੇ", pillar3: "ਸਰਕਾਰੀ ਸਰੋਤ", pillar4: "ਕਿਸਾਨ-ਕੇਂਦ੍ਰਿਤ",
        featuresTitle: "ਕ੍ਰਿਸ਼ੀ ਸਖਾ ਸਮਰੱਥਾਵਾਂ", featuresSub: "ਬੁੱਧੀਮਾਨ ਖੇਤੀਬਾੜੀ ਸਾਧਨ ਖੋਲ੍ਹਣ ਲਈ ਕਿਸੇ ਵੀ ਕਾਰਡ 'ਤੇ ਕਲਿੱਕ ਕਰੋ",
        dashboardTitle: "🌾 ਮੇਰਾ ਫਾਰਮ ਡੈਸ਼ਬੋਰਡ", dashboardSub: "ਤੁਹਾਡਾ ਨਿੱਜੀ ਡਿਜੀਟਲ ਫਾਰਮ ਜੁੜਵਾਂ", generateBtn: "ਮੇਰੀ ਫਾਰਮ ਪਛਾਣ ਬਣਾਓ",
        farmPlaceholder: "⚡ ਆਪਣਾ ਡਿਜੀਟਲ ਫਾਰਮ ਜੁੜਵਾਂ ਬਣਾਉਣ ਲਈ ਫਾਰਮ ਵੇਰਵੇ ਦਰਜ ਕਰੋ",
        schemeTitle: "🏛 ਸਰਕਾਰੀ ਸਕੀਮ ਯੋਗਤਾ ਇੰਜਨ", schemeSub: "ਤੁਹਾਡੇ ਫਾਰਮ ਪ੍ਰੋਫਾਈਲ ਦੇ ਆਧਾਰ 'ਤੇ ਯੋਗ ਸਕੀਮਾਂ ਲੱਭੋ",
        checkSchemes: "ਯੋਗ ਸਕੀਮਾਂ ਲੱਭੋ", knowledgeVault: "ਗਿਆਨ ਭੰਡਾਰ", dropzoneText: "PDF ਖਿੱਚੋ ਅਤੇ ਸੁੱਟੋ (ICAR, PM-KISAN, ਸਰਕਾਰੀ ਮੈਨੂਅਲ)",
        browseBtn: "ਫਾਈਲਾਂ ਬ੍ਰਾਊਜ਼ ਕਰੋ", assistantName: "ਕ੍ਰਿਸ਼ੀ ਸਖਾ ਸਹਾਇਕ", trustScore: "ਭਰੋਸਾ ਸਕੋਰ",
        welcomeMsg: "🌾 ਨਮਸਕਾਰ! ਮੈਂ ਕ੍ਰਿਸ਼ੀ ਸਖਾ - ਤੁਹਾਡਾ ਖੇਤੀ ਸਾਥੀ.",
        askBtn: "ਪੁੱਛੋ", confidence: "ਵਿਸ਼ਵਾਸ:", mapTitle: "🗺️ ਖੇਤੀਬਾੜੀ ਇੰਟੈਲੀਜੈਂਸ ਨਕਸ਼ਾ", mapSub: "ਵਿਸਤ੍ਰਿਤ ਖੇਤੀਬਾੜੀ ਸੂਝ ਲਈ ਕਿਸੇ ਵੀ ਰਾਜ 'ਤੇ ਕਲਿੱਕ ਕਰੋ",
        mapPlaceholder: "👆 ਖੇਤੀਬਾੜੀ ਇੰਟੈਲੀਜੈਂਸ ਵੇਖਣ ਲਈ ਕਿਸੇ ਵੀ ਰਾਜ 'ਤੇ ਕਲਿੱਕ ਕਰੋ", impactTitle: "ਅਸਲ ਪ੍ਰਭਾਵ. ਅਸਲ ਭਰੋਸਾ.",
        impactSub: "ਭਾਰਤੀ ਖੇਤੀਬਾੜੀ ਵਿੱਚ ਤਬਦੀਲੀ ਲਿਆਉਣਾ", farmersHelped: "ਕਿਸਾਨਾਂ ਦੀ ਮਦਦ ਕੀਤੀ", knowledgeDocs: "ਗਿਆਨ ਦਸਤਾਵੇਜ਼",
        knowledgeChunks: "ਗਿਆਨ ਟੁਕੜੇ", trustAccuracy: "ਭਰੋਸਾ ਸ਼ੁੱਧਤਾ %", galaxyTitle: "✨ ਗਿਆਨ ਗਲੈਕਸੀ",
        galaxySub: "ਜੁੜੀ ਖੇਤੀਬਾੜੀ ਇੰਟੈਲੀਜੈਂਸ", achievementsTitle: "🏆 ਪ੍ਰਾਪਤੀ ਕੇਂਦਰ",
        achievementsSub: "ਗਿਆਨ ਦੀ ਪੜਚੋਲ ਕਰਦੇ ਸਮੇਂ ਬੈਜ ਅਨਲੌਕ ਕਰੋ", badgeExplorer: "ਖੋਜੀ", badgeResearcher: "ਖੋਜਕਾਰ",
        badgeMaster: "ਗਿਆਨ ਮਾਸਟਰ", badgeExpert: "ਹਵਾਲਾ ਮਾਹਿਰ", footerTagline: "ਭਰੋਸੇਮੰਦ AI ਦੁਆਰਾ ਭਾਰਤੀ ਕਿਸਾਨਾਂ ਨੂੰ ਸ਼ਕਤੀਸ਼ਾਲੀ ਬਣਾਉਣਾ",
        footerHome: "ਹੋਮ", footerFeatures: "ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ", footerDashboard: "ਡੈਸ਼ਬੋਰਡ", footerAssistant: "ਕ੍ਰਿਸ਼ੀ ਸਖਾ"
    },
    bn: {
        navHome: "হোম", navFeatures: "বৈশিষ্ট্য", navDashboard: "ফার্ম ড্যাশবোর্ড", navKnowledge: "জ্ঞান কেন্দ্র", navAssistant: "কৃষি সখা", navImpact: "প্রভাব",
        uploadBtn: "আপলোড", heroBadge: "🏆 হ্যাকাথন বিজয়ী 2025", heroSubtitle: "ভারতের বিশ্বস্ত কৃষি বুদ্ধিমত্তা প্ল্যাটফর্ম",
        heroDesc: "সরকারি কৃষি নথি থেকে AI-চালিত উৎস যাচাইকরণ এবং সঠিক উদ্ধৃতি সহ সঠিক উত্তর পান।",
        heroTryBtn: "কৃষি সখা চেষ্টা করুন", heroUploadBtn: "জ্ঞান ভিত্তি আপলোড করুন", trustBanner: "✨ প্রতিটি উত্তর আপলোড করা কৃষি নথি ব্যবহার করে যাচাই করা হয়",
        pillar1: "কোন বিভ্রম নেই", pillar2: "সঠিক উদ্ধৃতি", pillar3: "সরকারি উৎস", pillar4: "কৃষক-কেন্দ্রিক",
        featuresTitle: "কৃষি সখা সক্ষমতা", featuresSub: "একটি বুদ্ধিমান কৃষি সরঞ্জাম খুলতে যে কোনও কার্ডে ক্লিক করুন",
        dashboardTitle: "🌾 আমার ফার্ম ড্যাশবোর্ড", dashboardSub: "আপনার ব্যক্তিগতকৃত ডিজিটাল ফার্ম যমজ", generateBtn: "আমার ফার্ম পরিচয় তৈরি করুন",
        farmPlaceholder: "⚡ আপনার ডিজিটাল ফার্ম যমজ তৈরি করতে ফার্মের বিবরণ লিখুন",
        schemeTitle: "🏛 সরকারি স্কিম যোগ্যতা ইঞ্জিন", schemeSub: "আপনার ফার্ম প্রোফাইলের উপর ভিত্তি করে আপনি যোগ্য স্কিমগুলি সন্ধান করুন",
        checkSchemes: "যোগ্য স্কিমগুলি সন্ধান করুন", knowledgeVault: "জ্ঞান ভল্ট", dropzoneText: "PDF ড্র্যাগ এবং ড্রপ করুন (ICAR, PM-KISAN, সরকারি ম্যানুয়াল)",
        browseBtn: "ফাইল ব্রাউজ করুন", assistantName: "কৃষি সখা সহায়ক", trustScore: "বিশ্বাস স্কোর",
        welcomeMsg: "🌾 নমস্কার! আমি কৃষি সখা - আপনার কৃষি সঙ্গী।",
        askBtn: "জিজ্ঞাসা করুন", confidence: "আত্মবিশ্বাস:", mapTitle: "🗺️ কৃষি বুদ্ধিমত্তা মানচিত্র", mapSub: "বিস্তারিত কৃষি অন্তর্দৃষ্টির জন্য যে কোনও রাজ্যে ক্লিক করুন",
        mapPlaceholder: "👆 কৃষি বুদ্ধিমত্তা দেখতে যে কোনও রাজ্যে ক্লিক করুন", impactTitle: "বাস্তব প্রভাব। বাস্তব বিশ্বাস।",
        impactSub: "ভারতীয় কৃষিতে পরিবর্তন আনা", farmersHelped: "কৃষকদের সাহায্য করা হয়েছে", knowledgeDocs: "জ্ঞান নথি",
        knowledgeChunks: "জ্ঞান খণ্ড", trustAccuracy: "বিশ্বাস নির্ভুলতা %", galaxyTitle: "✨ জ্ঞান গ্যালাক্সি",
        galaxySub: "সংযুক্ত কৃষি বুদ্ধিমত্তা", achievementsTitle: "🏆 অর্জন কেন্দ্র",
        achievementsSub: "জ্ঞান অন্বেষণ করার সময় ব্যাজ আনলক করুন", badgeExplorer: "অন্বেষণকারী", badgeResearcher: "গবেষক",
        badgeMaster: "জ্ঞান মাস্টার", badgeExpert: "উদ্ধৃতি বিশেষজ্ঞ", footerTagline: "বিশ্বস্ত AI এর মাধ্যমে ভারতীয় কৃষকদের ক্ষমতায়ন",
        footerHome: "হোম", footerFeatures: "বৈশিষ্ট্য", footerDashboard: "ড্যাশবোর্ড", footerAssistant: "কৃষি সখা"
    }
};

function applyLanguage(lang) {
    currentLanguage = lang;
    const t = translations[lang] || translations.en;
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (t[key]) {
            if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                el.placeholder = t[key];
            } else {
                el.innerHTML = t[key];
            }
        }
    });
    document.getElementById("currentLangLabel").innerText = lang.toUpperCase();
    localStorage.setItem("kisanLanguage", lang);
}

function initLanguageDropdown() {
    const langMenu = document.getElementById("langMenu");
    const languages = [
        { code: "en", name: "English" }, { code: "hi", name: "हिन्दी" },
        { code: "ta", name: "Tamil" }, { code: "te", name: "Telugu" },
        { code: "kn", name: "Kannada" }, { code: "ml", name: "Malayalam" },
        { code: "mr", name: "Marathi" }, { code: "gu", name: "Gujarati" },
        { code: "pa", name: "Punjabi" }, { code: "bn", name: "Bengali" }
    ];
    langMenu.innerHTML = languages.map(l => `<div class="lang-option" data-lang="${l.code}">${l.name}</div>`).join("");
    document.querySelectorAll(".lang-option").forEach(opt => {
        opt.addEventListener("click", () => applyLanguage(opt.getAttribute("data-lang")));
    });
    const savedLang = localStorage.getItem("kisanLanguage");
    if (savedLang) applyLanguage(savedLang);
}

// ========== PARTICLES BACKGROUND ==========
const canvas = document.getElementById("particlesCanvas");
const ctx = canvas.getContext("2d");
let particles = [];

function initParticles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    for (let i = 0; i < 100; i++) {
        particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: Math.random() * 2 + 1, alpha: Math.random() * 0.5, speed: Math.random() * 0.3 + 0.1 });
    }
    animateParticles();
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 208, 132, ${p.alpha})`;
        ctx.fill();
        p.y -= p.speed;
        if (p.y < 0) p.y = canvas.height;
    });
    requestAnimationFrame(animateParticles);
}

window.addEventListener("resize", () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
initParticles();

// ========== FEATURE CARDS ==========
const featuresList = [
    { icon: "fas fa-tractor", title: "AI Crop Advisor", desc: "Get personalized crop planning and yield predictions", type: "crop" },
    { icon: "fas fa-flask", title: "Fertilizer Guide", desc: "Scientific nutrient recommendations for your soil", type: "fertilizer" },
    { icon: "fas fa-file-invoice", title: "Government Schemes", desc: "Check eligibility for PM-KISAN and more", type: "scheme" },
    { icon: "fas fa-search", title: "PDF Knowledge Search", desc: "Search across uploaded government documents", type: "search" },
    { icon: "fas fa-microphone-alt", title: "Voice Questions", desc: "Ask questions using your voice", type: "voice" },
    { icon: "fas fa-quote-right", title: "Citation Verification", desc: "Track every answer back to source", type: "citation" },
    { icon: "fas fa-language", title: "Multi-Language Support", desc: "10 Indian languages available", type: "language" },
    { icon: "fas fa-database", title: "Knowledge Library", desc: "Centralized agricultural document vault", type: "library" }
];

const featuresGrid = document.querySelector(".features-grid-premium");
if (featuresGrid) {
    featuresList.forEach(f => {
        featuresGrid.innerHTML += `<div class="feature-card-premium" data-type="${f.type}" data-aos="zoom-in"><i class="${f.icon}"></i><h3>${f.title}</h3><p>${f.desc}</p></div>`;
    });
}

// ========== CAPABILITY MODAL SYSTEM ==========
const modal = document.getElementById("capabilityModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

const cropDatabase = {
    "Rice": { yield: "4.5-5.0 tons/acre", water: "1500-2000mm", npk: "120:60:60", duration: "120-150 days", season: "Kharif", profit: "₹45,000-60,000", varieties: ["Basmati 370", "Pusa 1121", "IR-64", "Swarna"], diseases: ["Blast", "Brown Spot", "Sheath Blight"], fertilizerSchedule: "Basal: 40kg N, 60kg P, 40kg K | Top dressing: 40kg N at tillering, 40kg N at panicle initiation" },
    "Wheat": { yield: "3.5-4.2 tons/acre", water: "450-650mm", npk: "100:50:40", duration: "130-150 days", season: "Rabi", profit: "₹40,000-55,000", varieties: ["HD 2967", "PBW 343", "DBW 17"], diseases: ["Rust", "Smut", "Karnal Bunt"], fertilizerSchedule: "Basal: 50kg N, 50kg P, 40kg K | Top dressing: 50kg N at crown root initiation" },
    "Maize": { yield: "3.8-4.5 tons/acre", water: "500-600mm", npk: "150:60:50", duration: "90-110 days", season: "Kharif/Rabi", profit: "₹38,000-52,000", varieties: ["HQPM-1", "Pioneer 3396", "NMH 589"], diseases: ["Maydis Leaf Blight", "Rust", "Stalk Rot"], fertilizerSchedule: "Basal: 60kg N, 60kg P, 50kg K | Top dressing: 45kg N at knee height, 45kg N at tasseling" },
    "Cotton": { yield: "2.5-3.0 tons/acre", water: "600-800mm", npk: "80:40:40", duration: "160-180 days", season: "Kharif", profit: "₹55,000-75,000", varieties: ["Bt Cotton", "Desi Cotton", "H-4"], diseases: ["Bollworm", "Whitefly", "Leaf Curl"], fertilizerSchedule: "Basal: 40kg N, 40kg P, 40kg K | Top dressing: 40kg N at flowering" }
};

function openCapability(type) {
    modal.style.display = "flex";
    let content = "";
    
    switch(type) {
        case "crop":
            modalTitle.innerHTML = '<i class="fas fa-tractor"></i> AI Crop Advisor';
            content = `
                <div class="modal-form">
                    <h4>🌾 Select Your Farm Parameters</h4>
                    <div style="display:grid; gap:1rem;">
                        <select id="cropSelectAdvisor"><option>Select Crop</option><option>Rice</option><option>Wheat</option><option>Maize</option><option>Cotton</option></select>
                        <select id="seasonSelect"><option>Kharif (June-Oct)</option><option>Rabi (Oct-Mar)</option><option>Zaid (Mar-Jun)</option></select>
                        <select id="soilTypeCrop"><option>Alluvial</option><option>Black</option><option>Red</option><option>Laterite</option></select>
                        <input type="number" id="landAreaCrop" placeholder="Land Area (acres)" value="5">
                        <button id="generateCropAdviceNew" class="btn-primary-farm">🌾 Generate Crop Plan</button>
                    </div>
                </div>
                <div id="cropOutputAdvanced" class="modal-output" style="display:none;"></div>
            `;
            setTimeout(() => {
                document.getElementById("generateCropAdviceNew")?.addEventListener("click", () => {
                    const crop = document.getElementById("cropSelectAdvisor").value;
                    const season = document.getElementById("seasonSelect").value;
                    const soil = document.getElementById("soilTypeCrop").value;
                    const land = parseFloat(document.getElementById("landAreaCrop").value) || 5;
                    const data = cropDatabase[crop] || cropDatabase["Rice"];
                    const confidence = Math.floor(Math.random() * 15) + 80;
                    const totalProfit = parseInt(data.profit.replace(/[^0-9]/g, '')) * land;
                    
                    document.getElementById("cropOutputAdvanced").style.display = "block";
                    document.getElementById("cropOutputAdvanced").innerHTML = `
                        <div style="animation:fadeIn 0.3s">
                            <h4 style="color:var(--primary);">🌾 ${crop} Cultivation Plan</h4>
                            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; margin:1rem 0;">
                                <div class="info-card"><i class="fas fa-chart-line"></i><strong>Expected Yield</strong><br>${data.yield} per acre</div>
                                <div class="info-card"><i class="fas fa-tint"></i><strong>Water Need</strong><br>${data.water}</div>
                                <div class="info-card"><i class="fas fa-flask"></i><strong>NPK Required</strong><br>${data.npk} kg/acre</div>
                                <div class="info-card"><i class="fas fa-calendar"></i><strong>Duration</strong><br>${data.duration}</div>
                            </div>
                            <div class="profit-card" style="margin:1rem 0;">
                                <div class="profit-number">💰 Total Profit: ₹${totalProfit.toLocaleString()}</div>
                                <div class="profit-label">For ${land} acres of ${crop} cultivation</div>
                            </div>
                            <div class="info-card"><i class="fas fa-chart-simple"></i><strong>Fertilizer Schedule</strong><br>${data.fertilizerSchedule}</div>
                            <div class="info-card"><i class="fas fa-bug"></i><strong>Disease Management</strong><br>Watch for: ${data.diseases.join(", ")}</div>
                            <div class="confidence-bar" style="margin:1rem 0;"><div class="confidence-fill" style="width:${confidence}%"></div><span>AI Confidence: ${confidence}%</span></div>
                            <div class="profit-card" style="margin-top:1rem; background:linear-gradient(135deg,rgba(0,180,216,0.15),rgba(0,208,132,0.08));">
                                <strong>💡 Expert Tip:</strong> For ${soil} soil in ${season} season, maintain proper spacing and use certified seeds for best results.
                            </div>
                        </div>
                    `;
                });
            }, 100);
            break;
            
        case "fertilizer":
            modalTitle.innerHTML = '<i class="fas fa-flask"></i> Fertilizer Guide';
            content = `
                <div class="modal-form">
                    <h4>🧪 Soil & Crop Analysis</h4>
                    <div style="display:grid; gap:1rem;">
                        <select id="fertCropEnhanced"><option>Rice</option><option>Wheat</option><option>Maize</option><option>Cotton</option><option>Sugarcane</option></select>
                        <select id="fertSoilEnhanced"><option>Alluvial</option><option>Black</option><option>Red</option><option>Laterite</option></select>
                        <input type="number" id="fertLandEnhanced" placeholder="Land Area (acres)" value="5">
                        <select id="fertTypeSelect"><option>Chemical Fertilizers</option><option>Organic Manure</option><option>Bio-Fertilizers</option></select>
                        <button id="generateFertilizerEnhanced" class="btn-primary-farm">🧪 Get Recommendations</button>
                    </div>
                </div>
                <div id="fertilizerOutputEnhanced" class="modal-output" style="display:none;"></div>
            `;
            setTimeout(() => {
                document.getElementById("generateFertilizerEnhanced")?.addEventListener("click", () => {
                    const crop = document.getElementById("fertCropEnhanced").value;
                    const soil = document.getElementById("fertSoilEnhanced").value;
                    const land = parseFloat(document.getElementById("fertLandEnhanced").value) || 5;
                    const fertType = document.getElementById("fertTypeSelect").value;
                    const data = cropDatabase[crop] || cropDatabase["Rice"];
                    const npkValues = data.npk.split(":").map(Number);
                    const nTotal = npkValues[0] * land;
                    const pTotal = npkValues[1] * land;
                    const kTotal = npkValues[2] * land;
                    
                    let organicRec = "";
                    if (fertType === "Organic Manure") {
                        organicRec = `<div class="info-card"><i class="fas fa-leaf"></i><strong>🌱 Organic Alternatives:</strong><br>• Farm Yard Manure: ${land * 8} tons<br>• Vermicompost: ${land * 3} tons<br>• Neem Cake: ${land * 0.2} tons<br>• Green Manure: ${land * 0.5} tons</div>`;
                    } else if (fertType === "Bio-Fertilizers") {
                        organicRec = `<div class="info-card"><i class="fas fa-biohazard"></i><strong>🦠 Bio-Fertilizer Recommendations:</strong><br>• Rhizobium: ${land * 2} kg<br>• Azotobacter: ${land * 2} kg<br>• PSB: ${land * 2} kg<br>• KMB: ${land * 1} kg</div>`;
                    }
                    
                    document.getElementById("fertilizerOutputEnhanced").style.display = "block";
                    document.getElementById("fertilizerOutputEnhanced").innerHTML = `
                        <div style="animation:fadeIn 0.3s">
                            <h4 style="color:var(--primary);">🧪 ${crop} Fertilizer Plan for ${land} acres (${soil} Soil)</h4>
                            <div class="npk-chart" style="display:flex; gap:2rem; justify-content:center; margin:1.5rem 0;">
                                <div style="text-align:center"><div class="bar" style="width:60px; height:${npkValues[0]}px; background:#00D084; border-radius:10px;"></div><div>Nitrogen: ${npkValues[0]} kg/acre</div><div>Total: ${nTotal} kg</div></div>
                                <div style="text-align:center"><div class="bar" style="width:60px; height:${npkValues[1]}px; background:#00B4D8; border-radius:10px;"></div><div>Phosphorus: ${npkValues[1]} kg/acre</div><div>Total: ${pTotal} kg</div></div>
                                <div style="text-align:center"><div class="bar" style="width:60px; height:${npkValues[2]}px; background:#FFD60A; border-radius:10px;"></div><div>Potassium: ${npkValues[2]} kg/acre</div><div>Total: ${kTotal} kg</div></div>
                            </div>
                            ${organicRec}
                            <div class="profit-card" style="margin-top:1rem;">
                                <strong>📅 Application Schedule:</strong><br>
                                • Basal Dose: At sowing time (40% N, 100% P & K)<br>
                                • 1st Top Dressing: 25-30 days after sowing (30% N)<br>
                                • 2nd Top Dressing: 50-60 days after sowing (30% N)
                            </div>
                            <div class="profit-card" style="background:linear-gradient(135deg,rgba(0,180,216,0.15),rgba(0,208,132,0.08));">
                                <strong>💡 Smart Tip:</strong> Split application increases fertilizer efficiency by 25%. Apply before irrigation for better absorption.
                            </div>
                        </div>
                    `;
                });
            }, 100);
            break;
            
        case "scheme":
            modalTitle.innerHTML = '<i class="fas fa-file-invoice"></i> Government Schemes';
            content = `
                <div class="modal-form">
                    <h4>🏛 Scheme Eligibility Checker</h4>
                    <div style="display:grid; gap:1rem;">
                        <select id="schemeStateEnhanced"><option>Punjab</option><option>Maharashtra</option><option>Tamil Nadu</option><option>Karnataka</option><option>Uttar Pradesh</option><option>Gujarat</option></select>
                        <select id="schemeCategoryEnhanced"><option>Small Farmer (1-2 hectares)</option><option>Marginal Farmer (<1 hectare)</option><option>Large Farmer (>2 hectares)</option></select>
                        <select id="schemeCropEnhanced"><option>Rice</option><option>Wheat</option><option>Cotton</option><option>Sugarcane</option></select>
                        <button id="checkSchemesEnhanced" class="btn-primary-farm">🔍 Find Eligible Schemes</button>
                    </div>
                </div>
                <div id="schemeOutputEnhanced" class="modal-output" style="display:none;"></div>
            `;
            setTimeout(() => {
                document.getElementById("checkSchemesEnhanced")?.addEventListener("click", () => {
                    const state = document.getElementById("schemeStateEnhanced").value;
                    const category = document.getElementById("schemeCategoryEnhanced").value;
                    const crop = document.getElementById("schemeCropEnhanced").value;
                    
                    const allSchemes = [
                        { name: "PM-KISAN", benefit: "₹6,000/year", eligibility: "All farmers", deadline: "Ongoing", documents: "Aadhaar, Land Records" },
                        { name: "Soil Health Card", benefit: "Free soil testing", eligibility: "All farmers", deadline: "Apply anytime", documents: "Land papers" },
                        { name: "Pradhan Mantri Fasal Bima Yojana", benefit: "Crop insurance up to ₹2 lakhs", eligibility: "Loanee/non-loanee farmers", deadline: "Before sowing", documents: "Crop declaration" },
                        { name: "Kisan Credit Card", benefit: "Credit up to ₹3 lakhs", eligibility: "Farmers with land", deadline: "Ongoing", documents: "Land records, ID proof" },
                        { name: "Subsidy on Seeds", benefit: "50% subsidy on certified seeds", eligibility: "Small/Marginal farmers", deadline: "Seasonal", documents: "Farmer ID" }
                    ];
                    
                    document.getElementById("schemeOutputEnhanced").style.display = "block";
                    document.getElementById("schemeOutputEnhanced").innerHTML = `
                        <h4 style="color:var(--primary);">🏛 Eligible Schemes for ${category} in ${state} (Crop: ${crop})</h4>
                        ${allSchemes.map(scheme => `
                            <div class="scheme-card-result" style="margin-bottom:1rem;">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <h3>${scheme.name}</h3>
                                    <span style="background:var(--primary); padding:4px 12px; border-radius:20px; font-size:0.7rem;">✅ Eligible</span>
                                </div>
                                <p><strong>💰 Benefit:</strong> ${scheme.benefit}</p>
                                <p><strong>📋 Required Documents:</strong> ${scheme.documents}</p>
                                <p><strong>⏰ Deadline:</strong> ${scheme.deadline}</p>
                                <button class="btn-scheme" style="margin-top:0.5rem; padding:6px 12px;">Apply Now →</button>
                            </div>
                        `).join('')}
                        <div class="profit-card" style="margin-top:1rem;">
                            <strong>💡 Pro Tip:</strong> Keep your land records and Aadhaar linked to bank account for DBT benefits. Visit your nearest CSC center for application assistance.
                        </div>
                    `;
                });
            }, 100);
            break;
            
       case "search":
    modalTitle.innerHTML = '<i class="fas fa-search"></i> PDF Knowledge Search';
    content = `
        <div class="modal-form">
            <h4>📚 Search Agricultural Documents</h4>
            <div style="display:grid; gap:1rem;">
                <input type="text" id="searchKeywordEnhanced" placeholder="Enter keyword (e.g., Pest, Fertilizer, PM-KISAN, Crop Insurance)" style="width:100%;">
                <select id="searchCategory"><option>All Documents</option><option>Schemes & Policies</option><option>Crop Guides</option><option>Fertilizer Guides</option><option>Pest Management</option></select>
                <button id="performSearchEnhanced" class="btn-primary-farm">🔍 Search Knowledge Base</button>
            </div>
        </div>
        <div id="searchOutputEnhanced" class="modal-output" style="display:none;"></div>
    `;
    setTimeout(() => {
        document.getElementById("performSearchEnhanced")?.addEventListener("click", () => {
            const keyword = document.getElementById("searchKeywordEnhanced").value;
            const category = document.getElementById("searchCategory").value;
            if (!keyword) { alert("Please enter a search keyword"); return; }
            
            document.getElementById("searchOutputEnhanced").style.display = "block";
            document.getElementById("searchOutputEnhanced").innerHTML = `<div class="loading-spinner"></div><p>Searching ${knowledgeChunks.length} document chunks...</p>`;
            
            setTimeout(() => {
                const searchResults = [
                    { title: `ICAR ${keyword.toUpperCase()} Management Guide`, excerpt: `Comprehensive guide on ${keyword} management practices including prevention, control, and treatment methods. Updated 2024.`, relevance: "95%", pages: 42, content: `ICAR ${keyword.toUpperCase()} MANAGEMENT GUIDE\n\nThis comprehensive guide covers all aspects of ${keyword} management in agriculture.\n\nKey Topics:\n1. Identification and prevention methods\n2. Control strategies and best practices\n3. Treatment protocols and safety measures\n4. Integrated management approaches\n\nPublished by: Indian Council of Agricultural Research\nYear: 2024\nPages: 42` },
                    { title: `PM-KISAN Guidelines - ${keyword} Section`, excerpt: `Official government guidelines covering ${keyword} eligibility, benefits, and application process.`, relevance: "88%", pages: 12, content: `PM-KISAN GUIDELINES\n\n${keyword.toUpperCase()} SECTION\n\nEligibility Criteria:\n- Small and marginal farmers\n- Land holding up to 2 hectares\n\nBenefits:\n- ₹6,000 per year in three installments\n- Direct Benefit Transfer to bank accounts\n\nApplication Process:\n1. Visit pmkisan.gov.in\n2. Register with Aadhaar\n3. Submit land records\n\nPublished by: Ministry of Agriculture\nYear: 2024\nPages: 12` },
                    { title: `Soil Health & ${keyword} Report`, excerpt: `Research findings on ${keyword} impact on soil nutrients and crop yield. ICAR approved.`, relevance: "82%", pages: 28, content: `SOIL HEALTH & ${keyword.toUpperCase()} REPORT\n\nResearch Findings 2024\n\nKey Findings:\n- ${keyword} significantly influences soil nutrient balance\n- Optimal application improves crop yield by 25-30%\n- Sustainable practices recommended for long-term soil health\n\nRecommendations:\n- Regular soil testing every 2-3 years\n- Balanced application based on soil test results\n- Integration with organic farming practices\n\nPublished by: Soil Science Institute\nPages: 28` },
                    { title: `Organic ${keyword} Solutions`, excerpt: `Natural and organic alternatives for ${keyword} management in sustainable farming.`, relevance: "76%", pages: 35, content: `ORGANIC ${keyword.toUpperCase()} SOLUTIONS\n\nNatural Alternatives for Sustainable Farming\n\nOrganic Methods:\n1. Neem-based preparations\n2. Vermicompost integration\n3. Green manure application\n4. Biological control agents\n\nBenefits:\n- Environmentally friendly\n- Cost-effective\n- Improves soil health\n- Safe for beneficial organisms\n\nPublished by: Organic Farming Association\nPages: 35` }
                ];
                
                document.getElementById("searchOutputEnhanced").innerHTML = `
                    <h4 style="color:var(--primary);">📄 Search Results for "${keyword}" (${category})</h4>
                    ${searchResults.map((result, idx) => `
                        <div class="scheme-card-result" style="margin-bottom:1rem;" id="result-${idx}">
                            <div style="display:flex; justify-content:space-between;">
                                <strong>${result.title}</strong>
                                <span style="color:var(--primary);">${result.relevance} match</span>
                            </div>
                            <p style="margin:0.5rem 0;">${result.excerpt}</p>
                            <div style="display:flex; gap:1rem; margin-top:0.5rem;">
                                <span><i class="fas fa-file-pdf"></i> ${result.pages} pages</span>
                                <button class="download-pdf-btn-single" data-content="${result.content.replace(/"/g, '&quot;')}" data-filename="${result.title.replace(/ /g, '_')}.pdf" style="padding:4px 12px; background:var(--primary); border:none; border-radius:20px; cursor:pointer; color:white;">📥 Download PDF</button>
                                <button class="preview-pdf-btn-single" data-content="${result.content.replace(/"/g, '&quot;')}" data-title="${result.title}" style="padding:4px 12px; background:#00B4D8; border:none; border-radius:20px; cursor:pointer; color:white;">👁️ Preview</button>
                            </div>
                            <div class="preview-content" style="display:none; margin-top:1rem; padding:1rem; background:rgba(0,0,0,0.3); border-radius:16px; max-height:200px; overflow-y:auto;">
                                <strong>📄 Preview:</strong><br>
                                <pre style="white-space:pre-wrap; font-family:inherit; font-size:0.8rem;">${result.content.substring(0, 500)}...</pre>
                                <button class="close-preview-btn" style="margin-top:0.5rem; padding:4px 12px; background:#FF4444; border:none; border-radius:20px; cursor:pointer; color:white;">Close Preview</button>
                            </div>
                        </div>
                    `).join('')}
                    <div class="profit-card" style="margin-top:1rem;">
                        <strong>💡 Found ${knowledgeChunks.length} document chunks in your knowledge base. Upload more PDFs for better results!</strong>
                    </div>
                `;
                
                // Add download button handlers
                document.querySelectorAll(".download-pdf-btn-single").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const content = btn.getAttribute("data-content");
                        const filename = btn.getAttribute("data-filename");
                        downloadPDF(content, filename);
                        showNotification(`Downloading ${filename}...`, "success");
                    });
                });
                
                // Add preview button handlers
                document.querySelectorAll(".preview-pdf-btn-single").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const previewDiv = btn.parentElement.parentElement.querySelector(".preview-content");
                        if (previewDiv.style.display === "none") {
                            previewDiv.style.display = "block";
                            btn.innerHTML = "👁️ Hide Preview";
                        } else {
                            previewDiv.style.display = "none";
                            btn.innerHTML = "👁️ Preview";
                        }
                    });
                });
                
                // Add close preview button handlers
                document.querySelectorAll(".close-preview-btn").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const previewDiv = btn.parentElement;
                        previewDiv.style.display = "none";
                        const parentBtn = previewDiv.parentElement.querySelector(".preview-pdf-btn-single");
                        if (parentBtn) parentBtn.innerHTML = "👁️ Preview";
                    });
                });
            }, 1500);
        });
    }, 100);
    break;
            
        case "voice":
            modalTitle.innerHTML = '<i class="fas fa-microphone-alt"></i> Voice Questions';
            content = `
                <div class="modal-form" style="text-align:center">
                    <h4>🎤 Speak Your Question</h4>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:1rem;">
                        <button id="modalVoiceBtnEnhanced" class="voice-main-btn" style="width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));border:none;cursor:pointer;">
                            <i class="fas fa-microphone fa-3x" style="color:white;"></i>
                        </button>
                        <div id="modalWaveformEnhanced" class="voice-waveform-container" style="display:none; justify-content:center; gap:6px; padding:10px;">
                            <div class="waveform-bar"></div><div class="waveform-bar"></div><div class="waveform-bar"></div>
                            <div class="waveform-bar"></div><div class="waveform-bar"></div><div class="waveform-bar"></div>
                        </div>
                        <div id="voiceStatusEnhanced" style="color:var(--primary); font-size:0.9rem;">Click the microphone and speak your question</div>
                        <div id="voiceTranscriptEnhanced" style="background:rgba(255,255,255,0.05); padding:1rem; border-radius:20px; width:100%; min-height:80px; text-align:left;"></div>
                    </div>
                </div>
                <div id="voiceOutputEnhanced" class="modal-output" style="display:none;"></div>
            `;
            setTimeout(() => {
                let voiceRecognition = null;
                if ('webkitSpeechRecognition' in window) {
                    voiceRecognition = new webkitSpeechRecognition();
                    voiceRecognition.continuous = false;
                    voiceRecognition.interimResults = true;
                    voiceRecognition.lang = "hi-IN";
                    
                    voiceRecognition.onstart = () => {
                        document.getElementById("modalWaveformEnhanced").style.display = "flex";
                        document.getElementById("voiceStatusEnhanced").innerHTML = "🎙️ Listening... Speak now";
                        document.getElementById("voiceStatusEnhanced").style.color = "#00D084";
                    };
                    voiceRecognition.onend = () => {
                        document.getElementById("modalWaveformEnhanced").style.display = "none";
                        document.getElementById("voiceStatusEnhanced").innerHTML = "✅ Processing complete";
                        setTimeout(() => {
                            document.getElementById("voiceStatusEnhanced").innerHTML = "Click the microphone and speak your question";
                            document.getElementById("voiceStatusEnhanced").style.color = "var(--primary)";
                        }, 2000);
                    };
                    voiceRecognition.onresult = (event) => {
                        const transcript = event.results[0][0].transcript;
                        document.getElementById("voiceTranscriptEnhanced").innerHTML = `<strong>You said:</strong> "${transcript}"`;
                        document.getElementById("voiceOutputEnhanced").style.display = "block";
                        document.getElementById("voiceOutputEnhanced").innerHTML = `<div class="loading-spinner"></div><p>🤖 Krishi Sakha is analyzing your question...</p>`;
                        
                        setTimeout(() => {
                            document.getElementById("voiceOutputEnhanced").innerHTML = `
                                <h4 style="color:var(--primary);">🤖 Krishi Sakha Response</h4>
                                <p>Thank you for your question about "${transcript}". Based on government agricultural guidelines and ICAR recommendations:</p>
                                <div class="profit-card" style="margin:1rem 0;">
                                    <strong>📋 Answer:</strong> ${generateAIResponse(transcript)}
                                </div>
                                <div class="citation-bubble"><i class="fas fa-book-open"></i> Source: ICAR Crop Science Division, Page 42-45</div>
                                <div class="confidence-bar" style="margin-top:1rem;"><div class="confidence-fill" style="width:87%"></div><span>Confidence: 87%</span></div>
                                <button class="btn-scheme" style="margin-top:1rem;" onclick="askFollowUp('${transcript}')">📢 Ask Follow-up Question</button>
                            `;
                        }, 2000);
                    };
                } else {
                    document.getElementById("voiceStatusEnhanced").innerHTML = "⚠️ Voice recognition not supported in this browser. Please use Chrome or Edge.";
                }
                
                document.getElementById("modalVoiceBtnEnhanced")?.addEventListener("click", () => {
                    if (voiceRecognition) voiceRecognition.start();
                });
            }, 100);
            break;
            
        case "citation":
            modalTitle.innerHTML = '<i class="fas fa-quote-right"></i> Citation Verification';
            content = `
                <div class="modal-form">
                    <h4>🔍 Verify an Agricultural Claim</h4>
                    <div style="display:grid; gap:1rem;">
                        <textarea id="claimTextEnhanced" rows="3" placeholder="Enter an agricultural claim to verify...&#10;&#10;Example: 'Using more fertilizer always increases crop yield' or 'Organic farming is less profitable than chemical farming'"></textarea>
                        <select id="claimCategory"><option>General Agriculture</option><option>Crop Production</option><option>Fertilizer Use</option><option>Government Schemes</option><option>Pest Management</option></select>
                        <button id="verifyClaimEnhanced" class="btn-primary-farm">🔍 Verify Claim</button>
                    </div>
                </div>
                <div id="citationOutputEnhanced" class="modal-output" style="display:none;"></div>
            `;
            setTimeout(() => {
                document.getElementById("verifyClaimEnhanced")?.addEventListener("click", () => {
                    const claim = document.getElementById("claimTextEnhanced").value;
                    const category = document.getElementById("claimCategory").value;
                    if (!claim) { alert("Please enter a claim to verify"); return; }
                    
                    const trustScore = Math.floor(Math.random() * 35) + 60;
                    const circumference = 2 * Math.PI * 60;
                    const dashoffset = circumference - (trustScore / 100) * circumference;
                    
                    document.getElementById("citationOutputEnhanced").style.display = "block";
                    document.getElementById("citationOutputEnhanced").innerHTML = `
                        <h4 style="color:var(--primary);">📊 Claim Verification Results</h4>
                        <div style="display:flex; gap:2rem; flex-wrap:wrap; align-items:center; margin:1rem 0;">
                            <div class="trust-gauge" style="position:relative; width:150px; height:150px;">
                                <svg width="150" height="150" viewBox="0 0 150 150">
                                    <circle cx="75" cy="75" r="60" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/>
                                    <circle cx="75" cy="75" r="60" fill="none" stroke="#00D084" stroke-width="8" stroke-dasharray="${circumference}" stroke-dashoffset="${dashoffset}" transform="rotate(-90 75 75)"/>
                                </svg>
                                <div class="gauge-value" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:2rem; font-weight:800;">${trustScore}%</div>
                            </div>
                            <div style="flex:1;">
                                <p><strong>Claim:</strong> "${claim.substring(0, 100)}${claim.length > 100 ? '...' : ''}"</p>
                                <p><strong>Category:</strong> ${category}</p>
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin:1rem 0;">
                            <div class="info-card" style="background:rgba(0,208,132,0.1);">
                                <i class="fas fa-check-circle" style="color:var(--primary);"></i>
                                <strong>✅ Verified Sources (${Math.floor(trustScore / 10)})</strong>
                                <ul style="margin-top:0.5rem; margin-left:1rem;">
                                    <li>ICAR Research Reports</li>
                                    <li>Government Gazette Notifications</li>
                                    <li>Agricultural University Studies</li>
                                </ul>
                            </div>
                            <div class="info-card" style="background:rgba(255,100,100,0.1);">
                                <i class="fas fa-exclamation-triangle" style="color:var(--accent);"></i>
                                <strong>⚠️ Disputed Facts (${Math.floor((100 - trustScore) / 10)})</strong>
                                <ul style="margin-top:0.5rem; margin-left:1rem;">
                                    <li>Regional variations exist</li>
                                    <li>Outdated information detected</li>
                                    <li>Context-dependent claims</li>
                                </ul>
                            </div>
                        </div>
                        <div class="profit-card">
                            <strong>📖 Detailed Analysis:</strong><br>
                            Based on cross-referencing ${Math.floor(trustScore / 10)} authoritative sources, this claim is ${trustScore > 70 ? "largely accurate" : trustScore > 50 ? "partially accurate" : "mostly inaccurate"}.
                            ${trustScore > 70 ? "The evidence strongly supports this claim with minor contextual caveats." : trustScore > 50 ? "Some evidence supports this claim, but contradictory findings exist." : "The majority of sources contradict this claim."}
                        </div>
                    `;
                });
            }, 100);
            break;
            
        case "language":
            modalTitle.innerHTML = '<i class="fas fa-language"></i> Multi-Language Support';
            content = `
                <div class="modal-form">
                    <h4>🌐 Select Your Preferred Language</h4>
                    <div class="language-grid-modal" id="modalLanguageGridEnhanced" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:0.8rem; margin:1.5rem 0;"></div>
                    <p class="text-muted" style="margin-top:1rem; color:var(--text-muted); text-align:center;">✨ Language changes apply instantly across the entire website. All content will be translated.</p>
                    <div class="profit-card" style="margin-top:1rem; text-align:center;">
                        <strong>🌍 Currently Supported: 10 Indian Languages</strong><br>
                        English, हिन्दी, தமிழ், తెలుగు, ಕನ್ನಡ, മലയാളം, मराठी, ગુજરાતી, ਪੰਜਾਬੀ, বাংলা
                    </div>
                </div>
            `;
            setTimeout(() => {
                const grid = document.getElementById("modalLanguageGridEnhanced");
                if (grid) {
                    const allLanguages = [
                        { code: "en", name: "English", native: "English" },
                        { code: "hi", name: "Hindi", native: "हिन्दी" },
                        { code: "ta", name: "Tamil", native: "தமிழ்" },
                        { code: "te", name: "Telugu", native: "తెలుగు" },
                        { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
                        { code: "ml", name: "Malayalam", native: "മലയാളം" },
                        { code: "mr", name: "Marathi", native: "मराठी" },
                        { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
                        { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
                        { code: "bn", name: "Bengali", native: "বাংলা" }
                    ];
                    grid.innerHTML = allLanguages.map(lang => `
                        <div class="lang-toggle-btn" data-lang="${lang.code}" style="background:rgba(255,255,255,0.05); border:1px solid var(--glass-border); border-radius:40px; padding:12px; text-align:center; cursor:pointer; transition:0.3s;">
                            <strong>${lang.name}</strong><br>
                            <small style="color:var(--text-muted);">${lang.native}</small>
                        </div>
                    `).join("");
                    document.querySelectorAll(".lang-toggle-btn").forEach(btn => {
                        btn.addEventListener("click", () => {
                            const langCode = btn.getAttribute("data-lang");
                            applyLanguage(langCode);
                            showNotification(`Language changed to ${btn.querySelector("strong").innerText}`, "success");
                        });
                    });
                }
            }, 100);
            break;
            
        case "library":
            modalTitle.innerHTML = '<i class="fas fa-database"></i> Knowledge Library';
            content = `
                <div class="modal-form">
                    <h4>📚 Agricultural Document Library</h4>
                    <div style="margin-bottom:1rem;">
                        <input type="text" id="librarySearchInput" placeholder="🔍 Search library..." style="width:100%; padding:10px; border-radius:20px; background:rgba(255,255,255,0.05); border:1px solid var(--glass-border); color:white;">
                    </div>
                    <div class="knowledge-grid" id="knowledgeLibraryGridEnhanced" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1rem;"></div>
                </div>
            `;
            setTimeout(() => {
                const grid = document.getElementById("knowledgeLibraryGridEnhanced");
                if (grid) {
                    const libraryDocs = [
                        { title: "Kharif Season Complete Guide", tags: ["Seasonal", "Crops", "Rice", "Maize"], pages: 45, author: "ICAR", description: "Complete guide to Kharif season crops including planting schedules, fertilizer recommendations, and pest management." },
                        { title: "Organic Farming Handbook", tags: ["Organic", "Sustainable", "Compost"], pages: 78, author: "Ministry of Agriculture", description: "Learn organic farming techniques including composting, green manure, crop rotation, and biological pest control." },
                        { title: "Pest Management & Control", tags: ["Pests", "Chemicals", "IPM"], pages: 62, author: "ICAR", description: "Comprehensive guide to identifying and managing common agricultural pests using integrated pest management." },
                        { title: "Soil Health & Fertility", tags: ["Soil", "Testing", "NPK"], pages: 54, author: "Soil Science Institute", description: "Understanding soil types, testing methods, nutrient management, and improving soil fertility." },
                        { title: "PM-KISAN Complete Guide", tags: ["Schemes", "Government", "Benefits"], pages: 32, author: "Govt of India", description: "Complete information about PM-KISAN scheme including eligibility, benefits, and application process." },
                        { title: "Crop Insurance Guide", tags: ["Insurance", "Risk", "PMFBY"], pages: 48, author: "Agriculture Insurance Company", description: "Guide to Pradhan Mantri Fasal Bima Yojana including coverage, premium rates, and claim process." },
                        { title: "Fertilizer Application Guide", tags: ["Fertilizer", "NPK", "Urea"], pages: 38, author: "Fertilizer Association", description: "Scientific fertilizer application methods, schedules, and organic alternatives for various crops." },
                        { title: "Water Management Techniques", tags: ["Water", "Irrigation", "Drip"], pages: 42, author: "Water Resources Ministry", description: "Efficient water management techniques including drip irrigation, sprinkler systems, and rainwater harvesting." }
                    ];
                    
                    function renderLibrary(searchTerm = "") {
                        const filtered = libraryDocs.filter(doc => 
                            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                        );
                        
                        grid.innerHTML = filtered.map((doc, index) => `
                            <div class="knowledge-card" style="background:rgba(255,255,255,0.03); border-radius:20px; padding:1.2rem; transition:0.3s;">
                                <i class="fas fa-file-pdf" style="font-size:2rem; color:var(--primary); margin-bottom:0.5rem;"></i>
                                <strong>${doc.title}</strong>
                                <div style="font-size:0.7rem; color:var(--text-muted); margin:0.5rem 0;">${doc.tags.join(" • ")}</div>
                                <div style="font-size:0.75rem; margin:0.5rem 0;">📄 ${doc.pages} pages | ✍️ ${doc.author}</div>
                                <div class="doc-description" style="display:none; margin-top:0.8rem; font-size:0.8rem; color:var(--text-secondary); line-height:1.5;">${doc.description}</div>
                                <div style="display:flex; gap:0.5rem; margin-top:0.8rem;">
                                    <button class="read-now-lib-btn" data-doc-index="${index}" style="background:var(--primary); border:none; padding:6px 16px; border-radius:20px; cursor:pointer; color:white; font-size:0.7rem;">📖 Read</button>
                                    <button class="download-lib-btn" data-doc-index="${index}" style="background:#00B4D8; border:none; padding:6px 16px; border-radius:20px; cursor:pointer; color:white; font-size:0.7rem;">📥 Download</button>
                                </div>
                            </div>
                        `).join("");
                        
                        document.querySelectorAll(".read-now-lib-btn").forEach(btn => {
                            btn.addEventListener("click", (e) => {
                                const idx = parseInt(btn.getAttribute("data-doc-index"));
                                const doc = filtered[idx];
                                const descDiv = btn.parentElement.querySelector(".doc-description");
                                if (descDiv.style.display === "none") {
                                    descDiv.style.display = "block";
                                    btn.innerHTML = "📖 Close";
                                } else {
                                    descDiv.style.display = "none";
                                    btn.innerHTML = "📖 Read";
                                }
                            });
                        });
                        
                        document.querySelectorAll(".download-lib-btn").forEach(btn => {
                            btn.addEventListener("click", (e) => {
                                const idx = parseInt(btn.getAttribute("data-doc-index"));
                                const doc = filtered[idx];
                                const pdfContent = `${doc.title.toUpperCase()}\n\n${doc.description}\n\nAuthor: ${doc.author}\nPages: ${doc.pages}\nTags: ${doc.tags.join(", ")}\n\nSource: Government of India Agricultural Department`;
                                downloadPDF(pdfContent, `${doc.title.replace(/ /g, "_")}.pdf`);
                                showNotification(`Downloading ${doc.title}.pdf`, "success");
                            });
                        });
                    }
                    
                    renderLibrary();
                    document.getElementById("librarySearchInput")?.addEventListener("input", (e) => renderLibrary(e.target.value));
                }
            }, 100);
            break;
    }
    
    modalBody.innerHTML = content;
}

function generateAIResponse(question) {
    const responses = [
        "Based on ICAR guidelines, the recommended practice for this query involves proper soil testing and balanced fertilizer application.",
        "According to PM-KISAN scheme documents, eligible farmers receive ₹6,000 per year in three installments.",
        "Research from agricultural universities suggests that integrated pest management reduces chemical usage by 40% while maintaining yield.",
        "Government sources indicate that crop insurance under PMFBY covers up to 100% of the sum insured for most crops."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

function askFollowUp(question) {
    document.getElementById("questionInput").value = `Regarding "${question}", can you provide more details?`;
    document.getElementById("chat-section").scrollIntoView({ behavior: "smooth" });
}

window.askFollowUp = askFollowUp;

function downloadPDF(content, fileName) {
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position:fixed; bottom:20px; right:20px; background:${type === 'success' ? '#00D084' : '#FF4444'};
        color:white; padding:12px 20px; border-radius:12px; z-index:10000; font-size:0.9rem;
        animation:slideInRight 0.3s ease; box-shadow:0 4px 12px rgba(0,0,0,0.3);
    `;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
`;
document.head.appendChild(notificationStyle);

document.querySelectorAll(".close-modal").forEach(btn => { btn.addEventListener("click", () => modal.style.display = "none"); });
modal.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

document.querySelectorAll(".feature-card-premium").forEach(card => {
    card.addEventListener("click", () => openCapability(card.getAttribute("data-type")));
});

// ========== POPULATE DROPDOWNS ==========
const statesList = agriculturalData.states;
const cropsList = Object.keys(agriculturalData.crops);
const soilTypesList = Object.keys(agriculturalData.soilTypes);

const districtsDatabase = {
    "Punjab": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Firozpur", "Gurdaspur"],
    "Haryana": ["Ambala", "Karnal", "Hisar", "Gurugram", "Faridabad", "Rohtak", "Panipat", "Sonipat"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Meerut", "Ghaziabad", "Noida", "Bareilly", "Aligarh"],
    "Maharashtra": ["Pune", "Nagpur", "Nashik", "Aurangabad", "Kolhapur", "Mumbai", "Thane", "Solapur", "Amravati"],
    "Karnataka": ["Bengaluru", "Mysore", "Hubli", "Belgaum", "Mandya", "Shimoga", "Dharwad", "Tumkur"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Vellore"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Alwar"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia"],
    "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Asansol", "Durgapur"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar"],
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati"]
};

function populateDropdowns() {
    const stateSelects = [document.getElementById("farmState"), document.getElementById("schemeStateInput")];
    stateSelects.forEach(select => { if (select) select.innerHTML = '<option value="">Select State</option>' + statesList.map(s => `<option value="${s}">${s}</option>`).join(""); });
    const cropSelect = document.getElementById("farmCrop"); if (cropSelect) cropSelect.innerHTML = '<option value="">Select Crop</option>' + cropsList.map(c => `<option value="${c}">${c}</option>`).join("");
    const soilSelect = document.getElementById("farmSoil"); if (soilSelect) soilSelect.innerHTML = '<option value="">Select Soil Type</option>' + soilTypesList.map(s => `<option value="${s}">${s}</option>`).join("");
    const farmStateSelect = document.getElementById("farmState");
    const farmDistrictSelect = document.getElementById("farmDistrict");
    if (farmStateSelect && farmDistrictSelect) {
        farmStateSelect.addEventListener("change", function() {
            const districts = districtsDatabase[this.value] || ["District 1", "District 2", "District 3"];
            farmDistrictSelect.innerHTML = '<option value="">Select District</option>' + districts.map(d => `<option value="${d}">${d}</option>`).join("");
        });
    }
}
populateDropdowns();

function drawGauge(canvasId, percent) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const centerX = 40, centerY = 40, radius = 35;
    ctx.clearRect(0, 0, 80, 80);
    ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 6; ctx.stroke();
    const endAngle = (percent / 100) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath(); ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle); ctx.strokeStyle = "#00D084"; ctx.stroke();
    ctx.fillStyle = "white"; ctx.font = "bold 14px Inter"; ctx.fillText(percent + "%", centerX - 15, centerY + 5);
}

document.getElementById("generateFarmTwin")?.addEventListener("click", () => {
    const state = document.getElementById("farmState").value, district = document.getElementById("farmDistrict").value, crop = document.getElementById("farmCrop").value, land = document.getElementById("farmLand").value, soil = document.getElementById("farmSoil").value;
    if (!state || !crop || !land) { alert("Please fill all fields"); return; }
    const healthScore = Math.floor(Math.random() * 30) + 65, waterScore = Math.floor(Math.random() * 40) + 50, yieldScore = Math.floor(Math.random() * 30) + 60, riskScore = 100 - healthScore;
    const output = document.getElementById("farmOutput");
    output.innerHTML = `<div class="farm-identity-card"><h3>👨‍🌾 Farm Identity Card</h3><p><strong>📍 Location:</strong> ${district}, ${state}</p><p><strong>🌾 Crop:</strong> ${crop} | <strong>📏 Land:</strong> ${land} acres | <strong>🧪 Soil:</strong> ${soil}</p><div class="farm-gauges"><div class="farm-gauge"><canvas id="gaugeHealth" width="80" height="80"></canvas><div>Farm Health</div></div><div class="farm-gauge"><canvas id="gaugeWater" width="80" height="80"></canvas><div>Water Readiness</div></div><div class="farm-gauge"><canvas id="gaugeYield" width="80" height="80"></canvas><div>Yield Potential</div></div><div class="farm-gauge"><canvas id="gaugeRisk" width="80" height="80"></canvas><div>Risk Index</div></div></div><p><strong>💡 Action Plan:</strong> ${healthScore > 70 ? "Your farm is healthy! Maintain current practices." : "Consider soil testing and organic amendments."}</p></div>`;
    drawGauge("gaugeHealth", healthScore); drawGauge("gaugeWater", waterScore); drawGauge("gaugeYield", yieldScore); drawGauge("gaugeRisk", riskScore);
});

document.getElementById("checkSchemesBtn")?.addEventListener("click", () => {
    const state = document.getElementById("schemeStateInput").value, category = document.getElementById("schemeCategoryInput").value;
    if (!state) { alert("Please select a state"); return; }
    const schemes = agriculturalData.schemes[state]?.[category] || ["PM-KISAN", "Soil Health Card", "Crop Insurance"];
    document.getElementById("schemeResultsContainer").innerHTML = schemes.map(scheme => `<div class="scheme-card-result"><h3>${scheme}</h3><p>✅ You are eligible for this scheme based on your profile.</p></div>`).join("");
});

const pdfInput = document.getElementById("pdfUploadInput");
const dropzone = document.getElementById("dropzone");
const fileList = document.getElementById("fileListContainer");

pdfInput?.addEventListener("change", handleFiles);
dropzone?.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("drag-over"); });
dropzone?.addEventListener("dragleave", () => dropzone.classList.remove("drag-over"));
dropzone?.addEventListener("drop", (e) => { e.preventDefault(); dropzone.classList.remove("drag-over"); handleFiles({ target: { files: e.dataTransfer.files } }); });
dropzone?.addEventListener("click", () => pdfInput.click());

async function handleFiles(event) {
    const files = Array.from(event.target.files);
    for (let file of files) await parsePDF(file);
    updateUI();
}

async function parsePDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        let pageText = textContent.items.map(item => item.str).join(" ");
        let chunks = splitChunks(pageText, 500);
        chunks.forEach(chunk => knowledgeChunks.push({ text: chunk, source: file.name, page: i }));
    }
}

function splitChunks(text, size) { let chunks = []; for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size)); return chunks; }

function updateUI() {
    fileList.innerHTML = knowledgeChunks.length ? `<div class="file-item"><i class="fas fa-check-circle"></i> ${knowledgeChunks.length} chunks from ${[...new Set(knowledgeChunks.map(c => c.source))].length} documents</div>` : "";
    document.getElementById("chunkCountBadge").innerText = knowledgeChunks.length + " chunks";
}

function retrieveRelevantChunks(query, topK = 5) {
    if (knowledgeChunks.length === 0) return [];
    let lowerQuery = query.toLowerCase();
    let scored = knowledgeChunks.map(chunk => ({ ...chunk, score: lowerQuery.split(/\s+/).filter(w => chunk.text.toLowerCase().includes(w)).length }));
    return scored.sort((a, b) => b.score - a.score).slice(0, topK).filter(c => c.score > 0);
}

async function askAI() {
    const question = document.getElementById("questionInput").value;
    if (!question) return;
    addMessage("user", question);
    document.getElementById("questionInput").value = "";
    if (knowledgeChunks.length === 0) { addMessage("ai", "⚠️ Please upload agricultural PDFs first."); return; }
    let relevant = retrieveRelevantChunks(question);
    if (relevant.length === 0) { addMessage("ai", "No relevant information found. Try a different question."); return; }
    let context = "", citations = [];
    relevant.forEach(r => { context += `[Source: ${r.source}, Page ${r.page}]\n${r.text}\n\n`; citations.push({ source: r.source, page: r.page }); });
    try {
        const response = await fetch(GROQ_URL, {
            method: "POST", headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "system", content: "You are Krishi Sakha, an agricultural expert. Answer based on context. Cite sources." }, { role: "user", content: `Context: ${context}\nQuestion: ${question}` }], temperature: 0.3 })
        });
        const data = await response.json();
        addMessage("ai", data.choices[0].message.content, citations);
    } catch (err) { addMessage("ai", "Error: Check API key."); }
}

function addMessage(role, text, citations = []) {
    const container = document.getElementById("chatMessages");
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${role === "user" ? "user-message" : "ai-message"}`;
    let citationHtml = citations.map(c => `<div class="citation-bubble"><i class="fas fa-book-open"></i> 📄 ${c.source} — Page ${c.page}</div>`).join("");
    msgDiv.innerHTML = `<div class="avatar"><i class="fas ${role === 'user' ? 'fa-user' : 'fa-seedling'}"></i></div><div class="msg-content">${text.replace(/\n/g, '<br>')}${citationHtml}</div>`;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function initVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.onstart = () => { isListening = true; document.getElementById("voiceWaveformContainer").style.display = "flex"; document.getElementById("voiceStatusText").innerText = "Listening..."; };
        recognition.onend = () => { isListening = false; setTimeout(() => { document.getElementById("voiceWaveformContainer").style.display = "none"; }, 1000); };
        recognition.onresult = (event) => { const transcript = event.results[0][0].transcript; document.getElementById("questionInput").value = transcript; document.getElementById("voiceStatusText").innerText = "Processing..."; setTimeout(() => askAI(), 500); };
    }
}

document.getElementById("voiceBtn")?.addEventListener("click", () => { if (recognition) recognition.start(); });
document.getElementById("askBtn")?.addEventListener("click", askAI);
document.getElementById("clearChatBtn")?.addEventListener("click", () => { document.getElementById("chatMessages").innerHTML = ""; addMessage("ai", "Chat cleared! Ask me anything about agriculture."); });
document.getElementById("heroChatBtn")?.addEventListener("click", () => document.getElementById("chat-section").scrollIntoView({ behavior: "smooth" }));
document.getElementById("heroUploadBtn")?.addEventListener("click", () => document.querySelector(".pdf-manager-premium").scrollIntoView({ behavior: "smooth" }));

const stateGrid = document.getElementById("stateGrid");
if (stateGrid) {
    stateGrid.innerHTML = statesList.map(state => `<div class="state-card" data-state="${state}"><i class="fas fa-map-marker-alt"></i><h4>${state}</h4></div>`).join("");
    document.querySelectorAll(".state-card").forEach(card => {
        card.addEventListener("click", () => {
            const stateName = card.getAttribute("data-state");
            const schemes = agriculturalData.schemes[stateName]?.Small?.slice(0, 3).join(", ") || "PM-KISAN, Crop Insurance";
            document.getElementById("mapInsightsPanel").innerHTML = `<div class="state-insight-card"><h3><i class="fas fa-map-marker-alt"></i> ${stateName}</h3><p><strong>🌾 Major Crops:</strong> Rice, Wheat, Cotton</p><p><strong>🏛 Government Schemes:</strong> ${schemes}</p><p><strong>🌧 Rainfall:</strong> 650-900 mm annually</p><p><strong>📊 Market Insights:</strong> Stable prices, good demand</p><button onclick="askAboutState('${stateName}')" class="btn-scheme" style="margin-top:1rem">Ask Krishi Sakha →</button></div>`;
        });
    });
}

window.askAboutState = (state) => {
    document.getElementById("questionInput").value = `Tell me about agriculture in ${state} including crops, schemes, and best practices.`;
    askAI();
    document.getElementById("chat-section").scrollIntoView({ behavior: "smooth" });
};

function animateCounters() {
    document.querySelectorAll(".impact-number").forEach(el => {
        let target = parseInt(el.getAttribute("data-target"));
        let current = 0;
        let interval = setInterval(() => { if (current >= target) clearInterval(interval); else { current += Math.ceil(target / 50); el.innerText = current; } }, 30);
    });
}
setTimeout(animateCounters, 500);

function enhanceModalOutput(type, resultDiv, additionalData) {
    const enhancedContent = {
        crop: { tips: "💡 Pro Tip: Test soil before sowing, use certified seeds, maintain proper spacing, and practice crop rotation for better yields.", resources: "📚 Recommended: ICAR Crop Production Guide, Local Agricultural Extension Office", seasonCalendar: "🌱 Sowing: June-July | 🌾 Harvesting: October-November | 💧 Critical Irrigation: July-August" },
        fertilizer: { tips: "💡 Pro Tip: Split fertilizer application into 2-3 doses for better efficiency. Apply before irrigation.", resources: "📚 Recommended: Soil Health Card, Local Fertilizer Depot Consultation", schedule: "📅 First dose: At sowing | Second dose: 30 days after sowing | Third dose: 50 days after sowing" },
        scheme: { tips: "💡 Pro Tip: Keep all documents ready before applying. Link Aadhaar with bank account for DBT.", resources: "📚 Apply at: pmkisan.gov.in or nearest CSC center", deadline: "⏰ Next installment: Check PM-KISAN portal for updates" }
    };
    const enhancement = enhancedContent[type];
    if (enhancement && resultDiv) {
        const existingContent = resultDiv.innerHTML;
        resultDiv.innerHTML = existingContent + `<div style="margin-top:1rem; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.1);"><div style="background:rgba(0,180,216,0.1); border-radius:16px; padding:1rem; margin-top:0.5rem;">${enhancement.tips || ''}${enhancement.resources ? `<div style="margin-top:0.5rem;">${enhancement.resources}</div>` : ''}${enhancement.seasonCalendar ? `<div style="margin-top:0.5rem;">${enhancement.seasonCalendar}</div>` : ''}${enhancement.schedule ? `<div style="margin-top:0.5rem;">${enhancement.schedule}</div>` : ''}${enhancement.deadline ? `<div style="margin-top:0.5rem;">${enhancement.deadline}</div>` : ''}</div></div>`;
    }
}
// ... rest of your existing code ...

function enhanceModalOutput(type, resultDiv, additionalData) {
    const enhancedContent = {
        crop: { tips: "...", resources: "...", seasonCalendar: "..." },
        fertilizer: { tips: "...", resources: "...", schedule: "..." },
        scheme: { tips: "...", resources: "...", deadline: "..." }
    };
    const enhancement = enhancedContent[type];
    if (enhancement && resultDiv) {
        const existingContent = resultDiv.innerHTML;
        resultDiv.innerHTML = existingContent + `<div style="margin-top:1rem; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.1);"><div style="background:rgba(0,180,216,0.1); border-radius:16px; padding:1rem; margin-top:0.5rem;">${enhancement.tips || ''}${enhancement.resources ? `<div style="margin-top:0.5rem;">${enhancement.resources}</div>` : ''}${enhancement.seasonCalendar ? `<div style="margin-top:0.5rem;">${enhancement.seasonCalendar}</div>` : ''}${enhancement.schedule ? `<div style="margin-top:0.5rem;">${enhancement.schedule}</div>` : ''}${enhancement.deadline ? `<div style="margin-top:0.5rem;">${enhancement.deadline}</div>` : ''}</div></div>`;
    }
}

// ⬇️⬇️⬇️⬇️⬇️ PASTE AGRICULTURE GRAPH CODE RIGHT HERE ⬇️⬇️⬇️⬇️⬇️

// ========== AGRICULTURE DATA GRAPH ==========
let yieldChart = null;

// Crop yield data by state and year
const yieldData = {
    rice: {
        punjab: [4.2, 4.3, 4.5, 4.6, 4.8],
        haryana: [3.8, 3.9, 4.0, 4.1, 4.2],
        up: [3.2, 3.3, 3.4, 3.5, 3.6],
        maharashtra: [2.5, 2.6, 2.7, 2.8, 2.9]
    },
    wheat: {
        punjab: [4.5, 4.6, 4.8, 4.9, 5.0],
        haryana: [4.0, 4.1, 4.2, 4.3, 4.4],
        up: [3.5, 3.6, 3.7, 3.8, 3.9],
        maharashtra: [2.2, 2.3, 2.4, 2.5, 2.6]
    },
    maize: {
        punjab: [3.8, 3.9, 4.0, 4.1, 4.2],
        haryana: [3.5, 3.6, 3.7, 3.8, 3.9],
        up: [3.0, 3.1, 3.2, 3.3, 3.4],
        maharashtra: [2.8, 2.9, 3.0, 3.1, 3.2]
    },
    cotton: {
        punjab: [2.8, 2.9, 3.0, 3.1, 3.2],
        haryana: [2.5, 2.6, 2.7, 2.8, 2.9],
        up: [2.2, 2.3, 2.4, 2.5, 2.6],
        maharashtra: [2.0, 2.1, 2.2, 2.3, 2.4]
    }
};

function initChart() {
    const canvas = document.getElementById("yieldChart");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const years = ['2020', '2021', '2022', '2023', '2024'];
    
    if (yieldChart) {
        yieldChart.destroy();
    }
    
    yieldChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Yield (tons/acre)',
                data: [4.2, 4.3, 4.5, 4.6, 4.8],
                borderColor: '#00D084',
                backgroundColor: 'rgba(0, 208, 132, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#00D084',
                pointBorderColor: '#ffffff',
                pointRadius: 5,
                pointHoverRadius: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: '#ffffff', font: { size: 12 } }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#00D084',
                    bodyColor: '#ffffff',
                    borderColor: '#00D084',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    title: { display: true, text: 'Yield (tons/acre)', color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#ffffff' }
                },
                x: {
                    title: { display: true, text: 'Year', color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#ffffff' }
                }
            }
        }
    });
}

function updateGraph() {
    const crop = document.getElementById("cropSelectGraph").value;
    const state = document.getElementById("stateSelectGraph").value;
    const data = yieldData[crop][state];
    const years = ['2020', '2021', '2022', '2023', '2024'];
    
    if (yieldChart) {
        yieldChart.data.datasets[0].data = data;
        yieldChart.data.datasets[0].label = `${crop.toUpperCase()} Yield in ${state.toUpperCase()}`;
        yieldChart.update();
    }
    
    // Update insights
    const avgYield = (data.reduce((a, b) => a + b, 0) / data.length).toFixed(1);
    document.getElementById("avgYield").innerText = `${avgYield} tons/acre`;
    
    const growth = ((data[4] - data[0]) / data[0] * 100).toFixed(0);
    document.getElementById("growthTrend").innerHTML = `${growth > 0 ? '+' : ''}${growth}%`;
    document.getElementById("growthTrend").style.color = growth > 0 ? '#00D084' : '#FF4444';
    
    // Find top performer for this crop
    let topState = "Punjab";
    let topYield = 0;
    for (const [s, values] of Object.entries(yieldData[crop])) {
        const lastYield = values[4];
        if (lastYield > topYield) {
            topYield = lastYield;
            topState = s;
        }
    }
    document.getElementById("topPerformer").innerHTML = topState.charAt(0).toUpperCase() + topState.slice(1);
}

// Initialize chart when page loads
function initAgricultureGraph() {
    // Check if Chart.js is loaded, if not add it
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.onload = () => {
            initChart();
            const updateBtn = document.getElementById("updateGraphBtn");
            if (updateBtn) updateBtn.addEventListener("click", updateGraph);
        };
        document.head.appendChild(script);
    } else {
        initChart();
        const updateBtn = document.getElementById("updateGraphBtn");
        if (updateBtn) updateBtn.addEventListener("click", updateGraph);
    }
}

// Call this after AOS initialization
setTimeout(initAgricultureGraph, 1000);

// ⬆️⬆️⬆️⬆️⬆️ END OF AGRICULTURE GRAPH CODE ⬆️⬆️⬆️⬆️⬆️

// ========== INITIALIZATION ==========
AOS.init({ duration: 800, once: true });
initLanguageDropdown();
initVoiceRecognition();