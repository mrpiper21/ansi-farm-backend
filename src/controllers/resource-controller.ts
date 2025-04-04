import Resource from "@/model/Resource";


// Create a new resource
export const createResource = async (req: any, res: any) => {
  try {
    // Validate category
    const validCategories = ['crops', 'soil', 'pests', 'irrigation'];
    if (!validCategories.includes(req.body.category)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid category' 
      });
    }

    const resource = new Resource(req.body);
    await resource.save();
    
    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all resources with pagination and filtering
export const getResources = async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query based on filters
    const query: any = {};
    
    // Filter by category if provided
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }
    
    // Filter by content type if provided
    if (req.query.contentType) {
      query.contentType = req.query.contentType;
    }
    
    const [resources, total] = await Promise.all([
      Resource.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Resource.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: resources,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message
    });
  }
};

// Get resource categories
export const getCategories = async (req: any, res: any) => {
  try {
    const categories = [
      { id: 'all', name: 'All Resources' },
      { id: 'crops', name: 'Crop Guides' },
      { id: 'soil', name: 'Soil Health' },
      { id: 'pests', name: 'Pest Control' },
      { id: 'irrigation', name: 'Irrigation' }
    ];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};