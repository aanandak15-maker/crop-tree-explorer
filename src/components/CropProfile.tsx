import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getCropByName, CropData } from '@/data/cropData';
import { supabase } from '@/integrations/supabase/client';
import VarietyCard from './VarietyCard';
import CropFlowChart from './CropFlowChart';
import ComparisonTool from './ComparisonTool';
import ImageGallery from './ImageGallery';
import { 
  ArrowLeft, 
  Info, 
  Thermometer, 
  Apple, 
  Bug, 
  Scissors, 
  TrendingUp,
  Lightbulb,
  MapPin,
  Calendar,
  Droplets,
  Sprout,
  Images,
  DollarSign,
  Wheat,
  Shield,
  Leaf,
  Sun,
  CloudRain,
  Zap
} from 'lucide-react';

interface CropProfileProps {
  cropName: string;
  onBack: () => void;
}

interface DbCrop {
  id: string;
  name: string;
  scientific_name?: string;
  family?: string;
  description?: string;
  season?: string[];
  climate_type?: string[];
  soil_type?: string[];
  water_requirement?: string;
  growth_duration?: string;
  temperature_range?: string;
  rainfall_requirement?: string;
  humidity_range?: string;
  soil_ph?: string;
  drainage_requirement?: string;
  land_preparation?: string[];
  seed_rate?: string;
  row_spacing?: string;
  sowing_time?: string;
  fertilizer_requirement?: string[];
  irrigation_schedule?: string[];
  harvesting_info?: string[];
  pest_list?: string[];
  disease_list?: string[];
  average_yield?: string;
  market_price?: string;
  cost_of_cultivation?: string;
  nutritional_info?: string;
  sustainability_practices?: string[];
  innovations?: string[];
  plant_height?: string;
  plant_width?: string;
  root_depth?: string;
  root_spread?: string;
  drought_tolerance?: string;
  heat_tolerance?: string;
  frost_tolerance?: string;
  salinity_tolerance?: string;
  water_use_efficiency?: string;
  soil_fertility_requirement?: string;
  soil_organic_matter?: string;
  soil_depth_requirement?: string;
  soil_compaction_tolerance?: string;
  npk_n?: string;
  npk_p?: string;
  npk_k?: string;
  micronutrient_needs?: string;
  optimum_temp?: string;
  tolerable_temp?: string;
  altitude?: string;
  light_requirement?: string;
  research_priorities?: string;
  breeding_objectives?: string;
  genetic_resources?: string;
}

const CropProfile: React.FC<CropProfileProps> = ({ cropName, onBack }) => {
  const [selectedVariety, setSelectedVariety] = useState<string | null>(null);
  const [dbCrop, setDbCrop] = useState<DbCrop | null>(null);
  const [dbVarieties, setDbVarieties] = useState<any[]>([]);
  const [dbPests, setDbPests] = useState<any[]>([]);
  const [dbDiseases, setDbDiseases] = useState<any[]>([]);
  const [cropImages, setCropImages] = useState<any[]>([]);
  const [varietyImages, setVarietyImages] = useState<any[]>([]);
  const [pestImages, setPestImages] = useState<any[]>([]);
  const [diseaseImages, setDiseaseImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const crop = getCropByName(cropName);

  useEffect(() => {
    fetchAllCropData();
  }, [cropName]);

  const fetchAllCropData = async () => {
    try {
      const { data: cropData, error: cropError } = await supabase
        .from('crops')
        .select('*')
        .ilike('name', cropName)
        .maybeSingle();
      
      if (cropData) {
        setDbCrop(cropData);
        
        const { data: varietiesData } = await supabase
          .from('varieties')
          .select('*')
          .eq('crop_id', cropData.id);
        
        const { data: pestsData } = await supabase
          .from('crop_pests')
          .select(`
            *,
            pests:pest_id (*)
          `)
          .eq('crop_id', cropData.id);
        
        const { data: diseasesData } = await supabase
          .from('crop_diseases')
          .select(`
            *,
            diseases:disease_id (*)
          `)
          .eq('crop_id', cropData.id);

        const [cropImagesData, varietyImagesData, pestImagesData, diseaseImagesData] = await Promise.all([
          supabase.from('crop_images').select('*').eq('crop_id', cropData.id),
          varietiesData && varietiesData.length > 0 
            ? supabase.from('variety_images').select('*').in('variety_id', varietiesData.map(v => v.id))
            : Promise.resolve({ data: [] }),
          pestsData && pestsData.length > 0
            ? supabase.from('pest_images').select('*').in('pest_id', pestsData.map(p => p.pest_id))
            : Promise.resolve({ data: [] }),
          diseasesData && diseasesData.length > 0
            ? supabase.from('disease_images').select('*').in('disease_id', diseasesData.map(d => d.disease_id))
            : Promise.resolve({ data: [] })
        ]);
        
        setDbVarieties(varietiesData || []);
        setDbPests(pestsData || []);
        setDbDiseases(diseasesData || []);
        setCropImages(cropImagesData.data || []);
        setVarietyImages(varietyImagesData.data || []);
        setPestImages(pestImagesData.data || []);
        setDiseaseImages(diseaseImagesData.data || []);
      }
    } catch (error) {
      console.error('Error fetching crop data from database:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!crop && !dbCrop && !loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Crop Not Found</h2>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  const cropData = crop || dbCrop;
  if (!cropData) return null;

  const allImages = [
    ...cropImages.map(img => ({
      id: img.id,
      url: img.image_url,
      title: img.caption || `${cropData.name} Image`,
      caption: img.alt_text,
      category: 'crop' as const,
      isPrimary: img.is_primary
    })),
    ...varietyImages.map(img => ({
      id: img.id,
      url: img.image_url,
      title: img.caption || `Variety Image`,
      caption: img.alt_text,
      category: 'variety' as const,
      isPrimary: img.is_primary
    })),
    ...pestImages.map(img => ({
      id: img.id,
      url: img.image_url,
      title: img.caption || `Pest Image`,
      caption: img.alt_text,
      category: 'pest' as const,
      isPrimary: img.is_primary
    })),
    ...diseaseImages.map(img => ({
      id: img.id,
      url: img.image_url,
      title: img.caption || `Disease Image`,
      caption: img.alt_text,
      category: 'disease' as const,
      isPrimary: img.is_primary
    }))
  ];

  const tabItems = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'varieties', label: 'Varieties', icon: Sprout },
    { id: 'cultivation', label: 'Cultivation Process', icon: Wheat },
    { id: 'climate', label: 'Climate & Soil', icon: Thermometer },
    { id: 'nutrition', label: 'Nutrition', icon: Apple },
    { id: 'pests', label: 'Pests & Diseases', icon: Bug },
    { id: 'economics', label: 'Economics', icon: DollarSign },
    { id: 'innovations', label: 'Innovations', icon: Lightbulb },
    { id: 'gallery', label: 'Images', icon: Images },
    { id: 'comparison', label: 'Compare Varieties', icon: TrendingUp },
    { id: 'additional', label: 'Additional Details', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-leaf-light to-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {crop?.name || dbCrop?.name}
              </h1>
              <p className="text-muted-foreground italic">
                {crop?.scientificName || dbCrop?.scientific_name}
              </p>
            </div>
            <Badge className="bg-crop-green text-white">
              {(crop?.season || dbCrop?.season || []).join(', ')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <Tabs defaultValue="varieties" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-max min-w-full bg-muted p-1">
              {tabItems.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sprout className="h-5 w-5 text-crop-green" />
                    Varieties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-crop-green">
                    {crop?.varieties?.length || dbVarieties.length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Available varieties</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-harvest-gold" />
                    Avg Yield
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-harvest-gold">
                    {dbCrop?.average_yield || 'N/A'}
                  </div>
                  <p className="text-sm text-muted-foreground">Quintals/hectare</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-secondary" />
                    Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-secondary">
                    {dbCrop?.growth_duration || 'N/A'}
                  </div>
                  <p className="text-sm text-muted-foreground">Days average</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Images className="h-5 w-5 text-primary" />
                    Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {allImages.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Total images</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Botanical Classification</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><span className="font-medium">Family:</span> {crop?.family || dbCrop?.family || 'Not specified'}</p>
                    <p><span className="font-medium">Scientific Name:</span> {crop?.scientificName || dbCrop?.scientific_name || 'Not specified'}</p>
                    <p><span className="font-medium">Season:</span> {(crop?.season || dbCrop?.season || []).join(', ')}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {dbCrop?.description || 'No description available.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="varieties" className="space-y-6">
            {crop?.varieties || dbVarieties.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {crop?.varieties?.map((variety) => (
                  <VarietyCard 
                    key={variety.name} 
                    variety={variety} 
                    isSelected={selectedVariety === variety.name}
                    onSelect={() => setSelectedVariety(
                      selectedVariety === variety.name ? null : variety.name
                    )}
                  />
                ))}
                
                {dbVarieties.map((variety) => (
                  <Card key={variety.id} className="border-2 hover:border-crop-green transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{variety.name}</span>
                        <Badge>{variety.maturity_group || 'Standard'}</Badge>
                      </CardTitle>
                      <CardDescription>{variety.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Duration:</span>
                          <span className="ml-2">{variety.duration || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="font-medium">Yield:</span>
                          <span className="ml-2">{variety.yield_potential || 'Not specified'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">No variety information available for this crop yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cultivation" className="space-y-6">
            {crop ? (
              <CropFlowChart crop={crop} selectedVariety={selectedVariety} />
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-crop-green" />
                        Planting Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {dbCrop?.seed_rate && (
                        <div>
                          <span className="font-medium">Seed Rate:</span>
                          <span className="ml-2 text-muted-foreground">{dbCrop.seed_rate}</span>
                        </div>
                      )}
                      {dbCrop?.row_spacing && (
                        <div>
                          <span className="font-medium">Row Spacing:</span>
                          <span className="ml-2 text-muted-foreground">{dbCrop.row_spacing}</span>
                        </div>
                      )}
                      {dbCrop?.sowing_time && (
                        <div>
                          <span className="font-medium">Sowing Time:</span>
                          <span className="ml-2 text-muted-foreground">{dbCrop.sowing_time}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dbCrop?.land_preparation && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Land Preparation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {dbCrop.land_preparation.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-crop-green rounded-full mt-2 flex-shrink-0"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                  
                  {dbCrop?.fertilizer_requirement && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Fertilizer Requirements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {dbCrop.fertilizer_requirement.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-harvest-gold rounded-full mt-2 flex-shrink-0"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="climate" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-primary" />
                    Climate Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium">Temperature:</span>
                    <span className="ml-2 text-muted-foreground">
                      {crop?.climate?.temperature || dbCrop?.temperature_range || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Rainfall:</span>
                    <span className="ml-2 text-muted-foreground">
                      {crop?.climate?.rainfall || dbCrop?.rainfall_requirement || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Humidity:</span>
                    <span className="ml-2 text-muted-foreground">
                      {crop?.climate?.humidity || dbCrop?.humidity_range || 'Not specified'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-primary" />
                    Soil Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium">Type:</span>
                    <span className="ml-2 text-muted-foreground">
                      {(crop?.soil?.type || dbCrop?.soil_type || []).join(', ') || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">pH:</span>
                    <span className="ml-2 text-muted-foreground">
                      {crop?.soil?.ph || dbCrop?.soil_ph || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Drainage:</span>
                    <span className="ml-2 text-muted-foreground">
                      {crop?.soil?.drainage || dbCrop?.drainage_requirement || 'Not specified'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-6">
            {crop?.nutritionalValue ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Apple className="h-5 w-5 text-primary" />
                    Nutritional Value (per 100g)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{crop.nutritionalValue.calories}</div>
                      <div className="text-sm text-muted-foreground">Calories</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-crop-green">{crop.nutritionalValue.protein}</div>
                      <div className="text-sm text-muted-foreground">Protein</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-harvest-gold">{crop.nutritionalValue.carbohydrates}</div>
                      <div className="text-sm text-muted-foreground">Carbs</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-secondary">{crop.nutritionalValue.fiber}</div>
                      <div className="text-sm text-muted-foreground">Fiber</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Apple className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Nutritional Data Not Available</h3>
                  <p className="text-muted-foreground">
                    {dbCrop?.nutritional_info || 'Detailed nutritional information is not available for this crop yet.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pests" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5 text-red-500" />
                    Common Pests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dbPests.map((pestRelation) => (
                      <div key={pestRelation.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{pestRelation.pests?.name}</h4>
                          <Badge variant="destructive">{pestRelation.severity_level}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {pestRelation.pests?.description}
                        </p>
                      </div>
                    ))}
                    
                    {dbPests.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">No pest information available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-500" />
                    Common Diseases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dbDiseases.map((diseaseRelation) => (
                      <div key={diseaseRelation.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{diseaseRelation.diseases?.name}</h4>
                          <Badge variant="destructive">{diseaseRelation.severity_level}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {diseaseRelation.diseases?.description}
                        </p>
                      </div>
                    ))}
                    
                    {dbDiseases.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">No disease information available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="economics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Economic Aspects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-crop-green">
                      {crop?.economics?.costOfCultivation || dbCrop?.cost_of_cultivation || 'Not specified'}
                    </div>
                    <div className="text-sm text-muted-foreground">Cost/hectare</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-harvest-gold">
                      {crop?.economics?.marketPrice || dbCrop?.market_price || 'Not specified'}
                    </div>
                    <div className="text-sm text-muted-foreground">Market Price</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {crop?.economics?.averageYield || dbCrop?.average_yield || 'Not specified'}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Yield</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="innovations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Climate Resilience & Innovations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Recent Innovations</h4>
                    <div className="space-y-2">
                      {(crop?.innovations || dbCrop?.innovations || []).map((innovation, index) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <p className="text-muted-foreground">{innovation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Sustainability Practices</h4>
                    <div className="space-y-2">
                      {(crop?.sustainability || dbCrop?.sustainability_practices || []).map((practice, index) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <p className="text-muted-foreground">{practice}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <ImageGallery 
              images={allImages}
              title={`${cropData.name} Image Gallery`}
            />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            {crop && <ComparisonTool crop={crop} />}
          </TabsContent>

          <TabsContent value="additional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Additional Crop Details
                </CardTitle>
                <CardDescription>
                  Comprehensive information about {cropData.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {dbCrop?.plant_height && (
                    <AccordionItem value="physical">
                      <AccordionTrigger>Physical Characteristics</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">Plant Height:</span>
                            <span className="ml-2 text-muted-foreground">{dbCrop.plant_height}</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CropProfile;