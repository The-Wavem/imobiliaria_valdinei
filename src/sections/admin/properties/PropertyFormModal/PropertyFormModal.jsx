import { useEffect, useMemo, useState } from "react";
import {
  Bath,
  BedDouble,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  ImagePlus,
  MapPin,
  Plus,
  Ruler,
  Save,
  Star,
  Trash2,
  X,
  CarFront,
  PlaySquare,
  Wand2,
} from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import Modal from "@components/ui/Modal/Modal.jsx";
import Input from "@components/ui/Input/Input.jsx";
import Select from "@components/ui/Select/Select.jsx";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Loader from "@components/ui/Loader/Loader.jsx";
import styles from "./PropertyFormModal.module.css";
import { checkCodeExists } from "../../../../services/propertyService.js";
import { uploadPropertyImage } from "../../../../services/storageService.js";
import { compressImage } from "../../../../utils/imageUtils.js";

const formatCurrencyDisplay = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(num);
};

const tabOptions = [
  { id: "basic", label: "Básico" },
  { id: "structure", label: "Estrutura" },
  { id: "description", label: "Descrição" },
  { id: "location", label: "Localização" },
  { id: "features", label: "Características" },
  { id: "media", label: "Mídias" },
];

const categoryOptions = [
  { label: "Selecione", value: "" },
  { label: "Alugar", value: "Alugar" },
  { label: "Comprar", value: "Comprar" },
  { label: "Venda e Aluguel", value: "Venda e Aluguel" },
];

const baseTypes = ["Casa", "Apartamento", "Comercial", "Cobertura"];

const basePropertyFeatures = [
  "Aceita animais", "Ar-condicionado", "Closet", "Cozinha americana", "Lareira", "Mobiliado", "Varanda gourmet"
];

const baseCondoFeatures = [
  "Academia", "Churrasqueira", "Cinema", "Espaço gourmet", "Jardim", "Piscina", "Playground", "Elevador", "Lavanderia", "Portaria 24h", "Pet friendly"
];

const defaultForm = {
  title: "", code: "", price: "", rentPrice: "", condo: "", iptu: "",
  category: "", type: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "",
  area: "", landArea: "", bedrooms: "", bathrooms: "", parkingSpaces: "", suites: "", unitFloor: "", floors: "", buildings: "", yearBuilt: "", unitsPerFloor: "",
  displayAddress: "All",
  caracteristicas_imovel: [], caracteristicas_condominio: [], photos: [], videos: [], description: "",
  status: "Disponível",
  featured: false,
  syncWithPortal: true
};

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ]
};

export default function PropertyFormModal({ isOpen, onClose, property, onSave }) {
  const mode = property ? "edit" : "create";
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState(defaultForm);
  const [availableTypes, setAvailableTypes] = useState(baseTypes);
  const [availablePropertyFeatures, setAvailablePropertyFeatures] = useState(basePropertyFeatures);
  const [availableCondoFeatures, setAvailableCondoFeatures] = useState(baseCondoFeatures);
  const [isAddingType, setIsAddingType] = useState(false);
  const [newType, setNewType] = useState("");
  const [newPropertyFeature, setNewPropertyFeature] = useState("");
  const [newCondoFeature, setNewCondoFeature] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [coverPhotoIndex, setCoverPhotoIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cepError, setCepError] = useState("");
  const [cepSuccess, setCepSuccess] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [oversizedPhotosUrls, setOversizedPhotosUrls] = useState([]);
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    // Constantes de Validação
    const MAX_SIZE_MB = 7;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`O formato do arquivo "${file.name}" não é permitido. Use JPG, PNG ou WEBP.`);
        return;
      }
      // Sem bloqueio de tamanho: apenas marcará como oversized depois
    }

    setIsUploadingMedia(true);
    try {
      const code = formData.code || 'novo';
      for (const file of files) {
        const isOversized = file.size > MAX_SIZE_BYTES;
        const compressedFile = await compressImage(file, 1920, 0.8);
        const url = await uploadPropertyImage(compressedFile, code);
        addPhoto(url);
        
        if (isOversized) {
          setOversizedPhotosUrls((prev) => [...prev, url]);
        }
      }
    } catch (error) {
      console.error("Erro no upload de arquivos:", error);
      alert("Houve um erro ao processar ou enviar a imagem. Tente novamente.");
    } finally {
      setIsUploadingMedia(false);
      // Reset input value so same files can be selected again
      event.target.value = '';
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setShowTips(false);
    setShowCancelConfirm(false);
    setActiveTab("basic");
    setIsAddingType(false);
    setNewType("");
    setNewPropertyFeature("");
    setNewCondoFeature("");
    setNewPhotoUrl("");
    setNewVideoUrl("");
    setCoverPhotoIndex(0);
    setIsSaving(false);
    setCepError("");
    setCepSuccess(false);
    setCodeError("");
    setIsGeneratingCode(false);

    if (property) {
      setFormData({
        title: property.title || property.content?.summary || "",
        code: property.code || "",
        price: property.pricing?.price || property.price || "",
        rentPrice: property.pricing?.rentPrice || property.rentPrice || "",
        condo: property.pricing?.condo || property.condo || "",
        iptu: property.pricing?.iptu || property.iptu || "",
        category: property.category || "",
        type: property.type || "",
        cep: property.location?.cep || property.cep || "",
        logradouro: property.location?.logradouro || property.location?.street || property.street || property.location?.address || property.address || "",
        numero: property.location?.numero || property.location?.number || property.number || "",
        complemento: property.location?.complemento || property.location?.complement || property.complement || "",
        bairro: property.location?.bairro || property.location?.neighborhood || property.neighborhood || "",
        cidade: property.location?.cidade || property.location?.city || property.city || "",
        estado: property.location?.estado || property.location?.state || property.state || "",
        area: property.area || property.location?.area || "",
        landArea: property.landArea || property.location?.landArea || "",
        bedrooms: property.bedrooms || property.location?.bedrooms || "",
        bathrooms: property.bathrooms || property.location?.bathrooms || "",
        parkingSpaces: property.parkingSpaces || property.location?.parkingSpaces || "",
        suites: property.suites || property.location?.suites || "",
        unitFloor: property.unitFloor || "",
        floors: property.floors || property.condoData?.floors || "",
        buildings: property.buildings || property.condoData?.buildings || "",
        yearBuilt: property.yearBuilt || property.condoData?.yearBuilt || "",
        unitsPerFloor: property.unitsPerFloor || property.condoData?.unitsPerFloor || "",
        displayAddress: property.displayAddress || "All",
        caracteristicas_imovel: property.caracteristicas_imovel || property.features || [],
        caracteristicas_condominio: property.caracteristicas_condominio || property.condoFeatures || [],
        photos: property.photos || [],
        videos: property.videos || [],
        description: property.content?.description || property.description || "",
        status: property.status || "Disponível",
        featured: property.featured || false,
        syncWithPortal: property.syncWithPortal ?? true
      });

      if (property.type) {
        setAvailableTypes((currentValue) =>
          currentValue.includes(property.type)
            ? currentValue
            : [...currentValue, property.type],
        );
      }

      if (Array.isArray(property.caracteristicas_imovel) || Array.isArray(property.features)) {
        setAvailablePropertyFeatures((currentValue) => {
          const nextValues = [...currentValue];
          const incoming = property.caracteristicas_imovel || property.features || [];
          incoming.forEach((feature) => {
            if (!nextValues.includes(feature)) {
              nextValues.push(feature);
            }
          });
          return nextValues;
        });
      }

      if (Array.isArray(property.caracteristicas_condominio) || Array.isArray(property.condoFeatures)) {
        setAvailableCondoFeatures((currentValue) => {
          const nextValues = [...currentValue];
          const incoming = property.caracteristicas_condominio || property.condoFeatures || [];
          incoming.forEach((feature) => {
            if (!nextValues.includes(feature)) {
              nextValues.push(feature);
            }
          });
          return nextValues;
        });
      }
    } else {
      setFormData(defaultForm);
    }
  }, [isOpen, property]);

  const typeOptions = useMemo(
    () => [
      { label: "Selecione", value: "" },
      ...availableTypes.map((item) => ({ label: item, value: item })),
    ],
    [availableTypes],
  );

  const updateField = (field, value) => {
    setFormData((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  };

  const handleCurrencyChange = (field, event) => {
    const rawValue = event.target.value.replace(/\D/g, "");
    updateField(field, rawValue);
  };

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    setCodeError('');
    let isUnique = false;
    let newCode = '';
    
    try {
      while (!isUnique) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        newCode = `VLD-${randomNum}`;
        const exists = await checkCodeExists(newCode, property?.firestoreId || property?.id);
        if (!exists) {
          isUnique = true;
        }
      }
      updateField('code', newCode);
    } catch (error) {
      console.error("Erro ao gerar código único:", error);
      setCodeError("Erro ao gerar código. Tente novamente.");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleCodeBlur = async (event) => {
    const code = event.target.value.trim();
    if (!code) {
      setCodeError('');
      return;
    }
    
    try {
      const exists = await checkCodeExists(code, property?.firestoreId || property?.id);
      if (exists) {
        setCodeError('Este código já está em uso ou já existiu e não pode ser repetido.');
      } else {
        setCodeError('');
      }
    } catch (error) {
      console.error("Erro ao validar código:", error);
    }
  };

  const handleCepChange = async (event) => {
    let value = event.target.value.replace(/\D/g, "");
    updateField("cep", value);
    setCepError("");
    setCepSuccess(false);

    if (value.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await response.json();
        
        if (data.erro) {
          setCepError("CEP não encontrado. Por favor, verifique.");
        } else {
          setCepSuccess(true);
          setFormData((prev) => ({
            ...prev,
            logradouro: data.logradouro || prev.logradouro,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade || prev.cidade,
            estado: data.uf || prev.estado,
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        setCepError("Erro ao buscar CEP. Tente novamente.");
      }
    }
  };

  const handleAddPropertyFeature = () => {
    const value = newPropertyFeature.trim();
    if (!value) return;
    setAvailablePropertyFeatures((currentValue) =>
      currentValue.includes(value) ? currentValue : [...currentValue, value],
    );
    setFormData((currentValue) => ({
      ...currentValue,
      caracteristicas_imovel: currentValue.caracteristicas_imovel.includes(value)
        ? currentValue.caracteristicas_imovel
        : [...currentValue.caracteristicas_imovel, value],
    }));
    setNewPropertyFeature("");
  };

  const handleAddCondoFeature = () => {
    const value = newCondoFeature.trim();
    if (!value) return;
    setAvailableCondoFeatures((currentValue) =>
      currentValue.includes(value) ? currentValue : [...currentValue, value],
    );
    setFormData((currentValue) => ({
      ...currentValue,
      caracteristicas_condominio: currentValue.caracteristicas_condominio.includes(value)
        ? currentValue.caracteristicas_condominio
        : [...currentValue.caracteristicas_condominio, value],
    }));
    setNewCondoFeature("");
  };

  const extractPhotoUrls = (rawValue) => {
    const textValue = String(rawValue || "");
    const urlMatches = textValue.match(/https?:\/\/[^\s"'<>]+/g) || [];

    if (urlMatches.length > 0) {
      return [...new Set(urlMatches.map((item) => item.trim()).filter(Boolean))];
    }

    return textValue
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const addPhoto = (urlValue) => {
    const nextUrls = extractPhotoUrls(urlValue);

    if (nextUrls.length === 0) {
      return;
    }

    setFormData((currentValue) => ({
      ...currentValue,
      photos: [
        ...currentValue.photos,
        ...nextUrls.filter((item) => !currentValue.photos.includes(item)),
      ],
      imageUrl: currentValue.photos.length === 0 ? nextUrls[0] : currentValue.imageUrl,
    }));
  };

  const handlePhotoPaste = (event) => {
    const pastedValue = event.clipboardData.getData("text");

    if (!pastedValue || !/[\n,;]/.test(pastedValue)) {
      return;
    }

    event.preventDefault();
    addPhoto(pastedValue);
    setNewPhotoUrl("");
  };

  const removePhoto = (photoIndex) => {
    setFormData((currentValue) => {
      const nextPhotos = currentValue.photos.filter(
        (_, index) => index !== photoIndex,
      );

      return {
        ...currentValue,
        photos: nextPhotos,
        imageUrl: nextPhotos[0] || "",
      };
    });

    if (coverPhotoIndex === photoIndex) {
      setCoverPhotoIndex(0);
    } else if (coverPhotoIndex > photoIndex) {
      setCoverPhotoIndex((prev) => prev - 1);
    }
  };

  const addVideo = (urlValue) => {
    const value = urlValue.trim();
    if (!value) return;

    setFormData((currentValue) => ({
      ...currentValue,
      videos: [...currentValue.videos, value],
    }));
  };

  const removeVideo = (videoIndex) => {
    setFormData((currentValue) => ({
      ...currentValue,
      videos: currentValue.videos.filter((_, index) => index !== videoIndex),
    }));
  };

  const togglePropertyFeature = (feature) => {
    setFormData((currentValue) => {
      const selectedFeatures = currentValue.caracteristicas_imovel.includes(feature)
        ? currentValue.caracteristicas_imovel.filter((item) => item !== feature)
        : [...currentValue.caracteristicas_imovel, feature];
      return { ...currentValue, caracteristicas_imovel: selectedFeatures };
    });
  };

  const toggleCondoFeature = (feature) => {
    setFormData((currentValue) => {
      const selectedFeatures = currentValue.caracteristicas_condominio.includes(feature)
        ? currentValue.caracteristicas_condominio.filter((item) => item !== feature)
        : [...currentValue.caracteristicas_condominio, feature];
      return { ...currentValue, caracteristicas_condominio: selectedFeatures };
    });
  };

  const confirmNewType = () => {
    const value = newType.trim();

    if (!value) {
      return;
    }

    setAvailableTypes((currentValue) =>
      currentValue.includes(value) ? currentValue : [...currentValue, value],
    );

    updateField("type", value);
    setIsAddingType(false);
    setNewType("");
  };

  const deleteType = (typeToRemove) => {
    setAvailableTypes((currentValue) =>
      currentValue.filter((item) => item !== typeToRemove),
    );
    updateField("type", formData.type === typeToRemove ? "" : formData.type);
  };

  const deletePropertyFeature = (featureToRemove) => {
    setAvailablePropertyFeatures((currentValue) => currentValue.filter((item) => item !== featureToRemove));
    setFormData((currentValue) => ({
      ...currentValue,
      caracteristicas_imovel: currentValue.caracteristicas_imovel.filter((item) => item !== featureToRemove),
    }));
  };

  const deleteCondoFeature = (featureToRemove) => {
    setAvailableCondoFeatures((currentValue) => currentValue.filter((item) => item !== featureToRemove));
    setFormData((currentValue) => ({
      ...currentValue,
      caracteristicas_condominio: currentValue.caracteristicas_condominio.filter((item) => item !== featureToRemove),
    }));
  };

  const isFormDirty = useMemo(() => {
    return (
      formData.title.trim() !== "" ||
      formData.price !== "" ||
      formData.logradouro.trim() !== "" ||
      formData.photos.length > 0 ||
      formData.videos.length > 0 ||
      formData.caracteristicas_imovel.length > 0 ||
      formData.caracteristicas_condominio.length > 0
    );
  }, [formData]);

  const scoringRules = useMemo(() => [
    { id: 'title', check: (d) => !!d.title?.trim(), points: 10, tip: "Adicione um título atraente" },
    { id: 'price', check: (d) => !!String(d.price)?.trim(), points: 10, tip: "Informe o preço do imóvel" },
    { id: 'area', check: (d) => !!String(d.area)?.trim(), points: 5, tip: "Adicione a área do imóvel" },
    { id: 'bedrooms', check: (d) => Number(d.bedrooms) > 0, points: 5, tip: "Informe o número de quartos" },
    { id: 'bathrooms', check: (d) => Number(d.bathrooms) > 0, points: 5, tip: "Informe o número de banheiros" },
    { id: 'cep', check: (d) => !!d.cep?.trim() && !!d.logradouro?.trim(), points: 10, tip: "Informe a localização (CEP e Logradouro)" },
    { id: 'features', check: (d) => (d.caracteristicas_imovel?.length + d.caracteristicas_condominio?.length) >= 3, points: 10, tip: "Adicione pelo menos 3 características" },
    { id: 'photos', check: (d) => d.photos?.length > 0, points: 15, tip: "Adicione fotos ao anúncio" },
    { id: 'photos_more', check: (d) => d.photos?.length > 4, points: 10, tip: "Adicione mais de 4 fotos" },
    { id: 'desc', check: (d) => d.description?.length > 50, points: 15, tip: "Escreva uma descrição detalhada (mais de 50 caracteres)" },
    { id: 'video', check: (d) => d.videos?.length > 0, points: 5, tip: "Adicione um vídeo do imóvel" }
  ], []);

  const scoreData = useMemo(() => {
    let score = 0;
    const tips = [];
    
    scoringRules.forEach(rule => {
      const isCompleted = rule.check(formData);
      if (isCompleted) {
        score += rule.points;
      }
      tips.push({
        id: rule.id,
        tip: rule.tip,
        completed: isCompleted,
      });
    });
    let color = "#ef4444"; // vermelho
    if (score >= 50) color = "#eab308"; // amarelo
    if (score >= 80) color = "#10b981"; // verde
    score = Math.min(score, 100);
    return { score, color, tips };
  }, [formData, scoringRules]);

  const fullAddressString = useMemo(() => {
    const parts = [];
    if (formData.logradouro) parts.push(formData.logradouro);
    if (formData.numero) parts.push(formData.numero);
    let str = parts.join(", ");
    
    const comp = [];
    if (formData.bairro) comp.push(formData.bairro);
    if (formData.cidade) comp.push(formData.cidade);
    if (formData.estado) comp.push(formData.estado);
    
    if (comp.length > 0) {
      str += (str ? " - " : "") + comp.join(", ");
    }
    
    return str;
  }, [formData.logradouro, formData.numero, formData.bairro, formData.cidade, formData.estado]);

  const handleCancelClick = () => {
    if (isFormDirty) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    onClose();
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      if (formData.code) {
        const codeExists = await checkCodeExists(formData.code, property?.firestoreId || property?.id);
        if (codeExists) {
          setCodeError('Este código já está em uso ou já existiu e não pode ser repetido.');
          setActiveTab("basic");
          setIsSaving(false);
          return;
        }
      }

      if (!formData.photos || formData.photos.length === 0) {
        alert("É obrigatório enviar pelo menos uma foto do imóvel para integração com os portais.");
        setActiveTab("media");
        setIsSaving(false);
        return;
      }

      const payload = { ...formData };
      
      // Filtra URLs inválidas
      payload.photos = payload.photos.filter(Boolean);
      
      const parts = [];
      if (payload.logradouro) parts.push(payload.logradouro);
      if (payload.numero) parts.push(payload.numero);
      
      let addressStr = parts.join(", ");
      
      const compBairro = [];
      if (payload.complemento) compBairro.push(payload.complemento);
      if (payload.bairro) compBairro.push(payload.bairro);
      
      if (compBairro.length > 0) {
        addressStr += ` - ${compBairro.join(", ")}`;
      }
      
      const cityState = [];
      if (payload.cidade) cityState.push(payload.cidade);
      if (payload.estado) cityState.push(payload.estado);
      
      if (cityState.length > 0) {
        addressStr += `, ${cityState.join(" - ")}`;
      }
      
      if (payload.cep) {
        addressStr += `, ${payload.cep}`;
      }

      payload.location = {
        cep: payload.cep,
        logradouro: payload.logradouro,
        numero: payload.numero,
        complemento: payload.complemento,
        bairro: payload.bairro,
        cidade: payload.cidade,
        estado: payload.estado,
        address: addressStr
      };

      // Limpar campos de localização temporários da raiz
      delete payload.cep;
      delete payload.logradouro;
      delete payload.numero;
      delete payload.complemento;
      delete payload.bairro;
      delete payload.cidade;
      delete payload.estado;

      await onSave(payload);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateTitle = () => {
    const { type, area, bedrooms, bairro } = formData;
    let titleParts = [];
    
    if (type) {
      titleParts.push(type);
    } else {
      titleParts.push("Imóvel");
    }

    const allFeatures = [].concat(formData.caracteristicas_imovel || [], formData.caracteristicas_condominio || []);
    if (allFeatures.length > 0) {
      const topFeatures = allFeatures.slice(0, 2);
      if (topFeatures.length > 0) {
        titleParts.push(`com ${topFeatures.join(" e ")}`);
      }
    }

    if (bedrooms && Number(bedrooms) > 0) {
      titleParts.push(`- ${bedrooms} Quartos`);
    } else if (formData.suites && Number(formData.suites) > 0) {
      titleParts.push(`- ${formData.suites} Suítes`);
    }

    if (area && Number(area) > 0) {
      titleParts.push(`- ${area}m²`);
    }

    if (bairro) {
      titleParts.push(`em ${bairro}`);
    }

    let generatedTitle = titleParts.join(" ");
    if (!generatedTitle) generatedTitle = "Novo Imóvel";

    updateField("title", generatedTitle);
  };

  const handleGenerateDescription = () => {
    const { category, type, area, bedrooms, suites, bathrooms, parkingSpaces, unitFloor, floors, unitsPerFloor, buildings, yearBuilt, bairro, cidade } = formData;
    
    let html = "";
    
    // Intro
    const tipoApresentacao = type || "este excelente imóvel";
    const local = bairro ? `no bairro <strong>${bairro}</strong>${cidade ? ` em ${cidade}` : ''}` : "em uma ótima localização";
    const cat = category ? ` disponível para <strong>${category.toLowerCase()}</strong>` : "";
    
    html += `<p>Apresentamos ${tipoApresentacao} ${local}${cat}, ideal para quem busca conforto e qualidade de vida.</p>`;
    
    // Estrutura
    const estrutura = [];
    if (area) estrutura.push(`<strong>${area}m²</strong> de área`);
    if (bedrooms) estrutura.push(`<strong>${bedrooms} quartos</strong>${suites ? ` (sendo <strong>${suites} suítes</strong>)` : ""}`);
    else if (suites) estrutura.push(`<strong>${suites} suítes</strong>`);
    if (bathrooms) estrutura.push(`<strong>${bathrooms} banheiros</strong>`);
    if (parkingSpaces) estrutura.push(`<strong>${parkingSpaces} vagas</strong> de garagem`);
    if (unitFloor) {
      const isNumber = !isNaN(unitFloor);
      estrutura.push(`situado no <strong>${unitFloor}${isNumber ? 'º andar' : ''}</strong>`);
    }
    
    if (estrutura.length > 0) {
      html += `<p>O imóvel conta com espaços bem distribuídos, contemplando ${estrutura.join(", ")}.</p>`;
    }

    // Estrutura do Condominio
    const condoEstrutura = [];
    if (buildings) condoEstrutura.push(`<strong>${buildings} torre(s)</strong>`);
    if (floors) condoEstrutura.push(`<strong>${floors} andares</strong>`);
    if (unitsPerFloor) condoEstrutura.push(`<strong>${unitsPerFloor} unidades por andar</strong>`);
    if (yearBuilt) condoEstrutura.push(`construção do ano de <strong>${yearBuilt}</strong>`);

    if (condoEstrutura.length > 0) {
      html += `<br/><p>O condomínio possui infraestrutura que abrange ${condoEstrutura.join(", ")}.</p>`;
    }
    
    // Características
    const allFeatures = [].concat(formData.caracteristicas_imovel || [], formData.caracteristicas_condominio || []);
    if (allFeatures.length > 0) {
      html += `<br/><p>Além disso, a propriedade oferece excelentes diferenciais, como: <em>${allFeatures.join(", ")}</em>.</p>`;
    }
    
    // Fechamento
    html += `<br/><p>Não perca essa oportunidade única! Entre em contato conosco e agende uma visita para conhecer o seu novo lar.</p>`;
    
    setFormData((prev) => ({ ...prev, description: html }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={styles.modalContent}
      contentClassName={styles.modalInnerContent}
      variant="admin"
    >
      <form className={styles.formContainer} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <header className={styles.modalHeader}>
          <div className={styles.headerTop}>
            <h2>{mode === "edit" ? "Editar imóvel" : "Adicionar imóvel"}</h2>
            <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Fechar modal">
              <X size={20} />
            </button>
          </div>
          <div className={styles.tabsHeaderContainer}>
            <nav
              className={styles.tabs}
              aria-label="Navegação das abas do formulário"
            >
              {tabOptions.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ""}`.trim()}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <label className={styles.syncToggleLabel} title="Enviar este imóvel para integração com o Canal Pro">
              <span className={styles.syncToggleText}>Sincronizar com Canal Pro</span>
              <div className={`${styles.syncToggleTrack} ${formData.syncWithPortal ? styles.syncToggleTrackActive : ''}`}>
                <input 
                  type="checkbox" 
                  className={styles.syncToggleInput} 
                  checked={formData.syncWithPortal} 
                  onChange={(e) => setFormData(prev => ({ ...prev, syncWithPortal: e.target.checked }))} 
                />
                <div className={styles.syncToggleThumb} />
              </div>
            </label>
          </div>
        </header>

        <div className={styles.modalBodyLayout}>
          <div className={styles.modalMainContent}>
          {activeTab === "basic" ? (
            <section className={styles.tabPanel}>
            <div className={styles.formGrid}>
              <div className={styles.inputWithGenerate}>
                <Input
                  label="Título"
                  placeholder="Ex: Casa térrea com piscina"
                  value={formData.title}
                  onChange={(event) => updateField("title", event.target.value)}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className={styles.generateBtn}
                  onClick={handleGenerateTitle}
                  title="Gerar título magicamente"
                >
                  <Wand2 size={16} />
                </Button>
              </div>
              <div className={styles.codeGroupContainer}>
                <Input
                  label="Código"
                  placeholder="Ex: VLD-1204"
                  value={formData.code}
                  onChange={(event) => updateField("code", event.target.value)}
                  onBlur={handleCodeBlur}
                  error={codeError}
                  className={styles.codeInput}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleGenerateCode}
                  disabled={isGeneratingCode}
                  className={styles.generateCodeBtn}
                >
                  {isGeneratingCode ? "Gerando..." : "Gerar Código"}
                </Button>
              </div>
              <div className={styles.selectRow}>
                <Select
                  label="Categoria"
                  value={formData.category}
                  onChange={(value) => updateField("category", value)}
                  options={categoryOptions}
                />
              </div>

              {(formData.category === "Comprar" || formData.category === "Venda e Aluguel") && (
                <Input
                  label="Preço de Venda"
                  type="text"
                  placeholder="R$ 0"
                  value={formatCurrencyDisplay(formData.price)}
                  onChange={(event) => handleCurrencyChange("price", event)}
                />
              )}

              {(formData.category === "Alugar" || formData.category === "Venda e Aluguel") && (
                <Input
                  label="Preço de Aluguel"
                  type="text"
                  placeholder="R$ 0"
                  value={formatCurrencyDisplay(formData.rentPrice)}
                  onChange={(event) => handleCurrencyChange("rentPrice", event)}
                />
              )}

              <Input
                label="Condomínio"
                type="text"
                placeholder="R$ 0"
                value={formatCurrencyDisplay(formData.condo)}
                onChange={(event) => handleCurrencyChange("condo", event)}
              />
              <Input
                label="IPTU"
                type="text"
                placeholder="R$ 0"
                value={formatCurrencyDisplay(formData.iptu)}
                onChange={(event) => handleCurrencyChange("iptu", event)}
              />

              <div className={styles.featuredToggleContainer}>
                <label className={styles.featuredToggleLabel}>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => updateField("featured", e.target.checked)}
                    className={styles.featuredToggleInput}
                  />
                  <div className={styles.featuredToggleText}>
                    <Star size={16} className={formData.featured ? styles.starActive : ""} />
                    <span>Destacar este imóvel na Home e no topo das buscas</span>
                  </div>
                </label>
              </div>

              <div className={styles.dynamicSelectRow}>
                <div className={styles.dynamicSelectGroup}>
                  {isAddingType ? (
                    <div className={styles.typeEditorBox}>
                      <div className={styles.typeBadgeList}>
                        {availableTypes.map((typeItem) => (
                          <span key={typeItem} className={styles.typeBadge}>
                            <span>{typeItem}</span>
                            <button
                              type="button"
                              className={styles.typeBadgeRemoveButton}
                              onClick={() => deleteType(typeItem)}
                              aria-label={`Remover tipo ${typeItem}`}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className={styles.inlineEditRow}>
                        <Input
                          label="Novo tipo"
                          placeholder="Ex: Cobertura duplex"
                          value={newType}
                          onChange={(event) => setNewType(event.target.value)}
                          className={styles.inlineInput}
                        />
                        <div className={styles.inlineActionGroup}>
                          <Button
                            type="button"
                            variant="outline"
                            className={styles.inlineIconButton}
                            onClick={confirmNewType}
                            aria-label="Confirmar novo tipo"
                          >
                            <Check size={16} />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className={styles.inlineIconButton}
                            onClick={() => {
                              setIsAddingType(false);
                              setNewType("");
                            }}
                            aria-label="Cancelar novo tipo"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.selectRow}>
                      <Select
                        label="Tipo"
                        options={typeOptions}
                        value={formData.type}
                        onChange={(value) => updateField("type", value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className={styles.inlineAddButton}
                        onClick={() => setIsAddingType(true)}
                        aria-label="Adicionar novo tipo"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "structure" ? (
          <section className={styles.tabPanel}>
            <div className={styles.formGrid}>
              <Input
                label="Área Construída (m²)"
                icon={Ruler}
                type="number"
                placeholder="Ex: 150"
                value={formData.area}
                onChange={(event) => updateField("area", event.target.value)}
              />
              <Input
                label="Área do Terreno (m²)"
                icon={Ruler}
                type="number"
                placeholder="Ex: 300 (opcional)"
                value={formData.landArea}
                onChange={(event) => updateField("landArea", event.target.value)}
              />
              <Input
                label="Quartos"
                icon={BedDouble}
                type="number"
                placeholder="0"
                value={formData.bedrooms}
                onChange={(event) =>
                  updateField("bedrooms", event.target.value)
                }
              />
              <Input
                label="Suítes"
                icon={BedDouble}
                type="number"
                placeholder="0"
                value={formData.suites}
                onChange={(event) =>
                  updateField("suites", event.target.value)
                }
              />
              <Input
                label="Banheiros"
                icon={Bath}
                type="number"
                placeholder="0"
                value={formData.bathrooms}
                onChange={(event) =>
                  updateField("bathrooms", event.target.value)
                }
              />
              <Input
                label="Vagas"
                icon={CarFront}
                type="number"
                placeholder="0"
                value={formData.parkingSpaces}
                onChange={(event) =>
                  updateField("parkingSpaces", event.target.value)
                }
              />
              <Input
                label="Andar do imóvel"
                type="text"
                placeholder="Ex: 5, Térreo, Cobertura"
                value={formData.unitFloor}
                onChange={(event) =>
                  updateField("unitFloor", event.target.value)
                }
              />
            </div>
            
            <div className={styles.featureIntro} style={{ marginTop: '2.5rem' }}>
              <div>
                <h3 className={styles.featureTitle}>Sobre o Condomínio</h3>
              </div>
              <p className={styles.featureDescription}>Detalhes da infraestrutura predial.</p>
            </div>
            
            <div className={styles.formGrid}>
              <Input
                label="Nº de Andares"
                type="number"
                placeholder="Ex: 10"
                value={formData.floors}
                onChange={(event) =>
                  updateField("floors", event.target.value)
                }
              />
              <Input
                label="Unidades por Andar"
                type="number"
                placeholder="Ex: 4"
                value={formData.unitsPerFloor}
                onChange={(event) =>
                  updateField("unitsPerFloor", event.target.value)
                }
              />
              <Input
                label="Nº de Torres (Buildings)"
                type="number"
                placeholder="Ex: 2"
                value={formData.buildings}
                onChange={(event) =>
                  updateField("buildings", event.target.value)
                }
              />
              <Input
                label="Ano de Construção"
                type="number"
                placeholder="Ex: 2015"
                value={formData.yearBuilt}
                onChange={(event) =>
                  updateField("yearBuilt", event.target.value)
                }
              />
            </div>
          </section>
        ) : null}

        {activeTab === "location" ? (
          <section className={styles.tabPanel}>
            <div className={styles.formGrid}>
              <Select
                label="Mostrar Endereço"
                options={[
                  { label: "Completo", value: "All" },
                  { label: "Somente Rua", value: "Street" },
                  { label: "Somente Bairro", value: "Neighborhood" },
                ]}
                value={formData.displayAddress}
                onChange={(value) => updateField("displayAddress", value)}
              />
              <Input
                label="CEP"
                placeholder="Apenas números"
                value={formData.cep}
                onChange={handleCepChange}
                maxLength={8}
                error={cepError}
                success={cepSuccess}
              />
              <Input
                label="Logradouro"
                icon={MapPin}
                placeholder="Rua, avenida..."
                value={formData.logradouro}
                onChange={(event) => updateField("logradouro", event.target.value)}
              />
              <Input
                label="Número"
                placeholder="Ex: 123"
                value={formData.numero}
                onChange={(event) => updateField("numero", event.target.value)}
              />
              <Input
                label="Complemento"
                placeholder="Ex: Apto 42"
                value={formData.complemento}
                onChange={(event) => updateField("complemento", event.target.value)}
              />
              <Input
                label="Bairro"
                placeholder="Nome do bairro"
                value={formData.bairro}
                onChange={(event) =>
                  updateField("bairro", event.target.value)
                }
              />
              <Input
                label="Cidade"
                placeholder="Sua cidade"
                value={formData.cidade}
                onChange={(event) => updateField("cidade", event.target.value)}
              />
              <Input
                label="Estado (UF)"
                placeholder="Ex: SP"
                value={formData.estado}
                onChange={(event) => updateField("estado", event.target.value)}
                maxLength={2}
              />
            </div>

            {fullAddressString && (
              <div className={styles.mapContainer}>
                <h4 className={styles.mapTitle}>Confirme a Localização no Mapa</h4>
                <iframe
                  title="Mapa da Propriedade"
                  width="100%"
                  height="250"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddressString)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className={styles.mapIframe}
                ></iframe>
              </div>
            )}
          </section>
        ) : null}

        {activeTab === "features" ? (
          <section className={styles.tabPanel}>
            <div className={styles.featureIntro}>
              <div>
                <p className={styles.featureKicker}>Comodidades</p>
                <h3 className={styles.featureTitle}>Características do Imóvel</h3>
              </div>
              <p className={styles.featureDescription}>Diferenciais exclusivos deste imóvel (ex: Ar-condicionado, varanda).</p>
            </div>

            <div className={styles.featureToolbar}>
              <Input
                label="Nova característica (Imóvel)"
                placeholder="Ex: Piso aquecido"
                value={newPropertyFeature}
                onChange={(event) => setNewPropertyFeature(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddPropertyFeature();
                  }
                }}
                className={styles.featureToolbarInput}
              />
              <Button type="button" variant="primary" className={styles.featureToolbarButton} onClick={handleAddPropertyFeature}>Adicionar</Button>
            </div>

            <div className={styles.featureGrid}>
              {availablePropertyFeatures.map((featureItem) => (
                <div key={featureItem} className={styles.featureCard}>
                  <label className={styles.featureCheckLabel}>
                    <input type="checkbox" checked={formData.caracteristicas_imovel.includes(featureItem)} onChange={() => togglePropertyFeature(featureItem)} />
                    <span>{featureItem}</span>
                  </label>
                  <button type="button" className={styles.featureDeleteButton} onClick={() => deletePropertyFeature(featureItem)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.featureIntro} style={{ marginTop: '2.5rem' }}>
              <div>
                <h3 className={styles.featureTitle}>Características do Condomínio</h3>
              </div>
              <p className={styles.featureDescription}>Infraestrutura do prédio ou área comum (ex: Piscina, Portaria).</p>
            </div>

            <div className={styles.featureToolbar}>
              <Input
                label="Nova característica (Condomínio)"
                placeholder="Ex: Sala de jogos"
                value={newCondoFeature}
                onChange={(event) => setNewCondoFeature(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddCondoFeature();
                  }
                }}
                className={styles.featureToolbarInput}
              />
              <Button type="button" variant="primary" className={styles.featureToolbarButton} onClick={handleAddCondoFeature}>Adicionar</Button>
            </div>

            <div className={styles.featureGrid}>
              {availableCondoFeatures.map((featureItem) => (
                <div key={featureItem} className={styles.featureCard}>
                  <label className={styles.featureCheckLabel}>
                    <input type="checkbox" checked={formData.caracteristicas_condominio.includes(featureItem)} onChange={() => toggleCondoFeature(featureItem)} />
                    <span>{featureItem}</span>
                  </label>
                  <button type="button" className={styles.featureDeleteButton} onClick={() => deleteCondoFeature(featureItem)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "media" ? (
          <section className={styles.tabPanel}>
            <div className={styles.mediaDropzone}>
              <input
                type="file"
                multiple
                accept="image/*"
                id="property-image-upload"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              <div
                className={styles.mediaDropzoneClickable}
                onClick={() => document.getElementById("property-image-upload").click()}
              >
                {isUploadingMedia ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <Loader size={34} />
                    <div style={{ marginTop: '1rem', fontWeight: 600, color: 'var(--text-color)' }}>Enviando imagens para a nuvem...</div>
                  </div>
                ) : (
                  <>
                    <div className={styles.mediaDropzoneIcon} aria-hidden="true">
                      <Camera size={34} />
                    </div>
                    <div className={styles.mediaDropzoneText}>
                      <strong>Clique aqui para fazer upload de fotos reais</strong>
                      <span>
                        Selecione as imagens diretamente do seu computador. Ou você pode inserir URLs na opção abaixo.
                        <br />
                        <span style={{ fontSize: '0.85em', color: 'var(--color-primary, #D4AF37)', display: 'block', marginTop: '6px' }}>
                          Formatos aceitos: JPG, PNG e WEBP. Tamanho máximo por foto: 7MB.
                        </span>
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.mediaDropzoneActions}>
                <Input
                  label="URL da mídia"
                  icon={ImagePlus}
                  placeholder="Cole uma ou mais URLs da foto"
                  value={newPhotoUrl}
                  onChange={(event) => setNewPhotoUrl(event.target.value)}
                  onPaste={handlePhotoPaste}
                  className={styles.mediaDropzoneInput}
                />
                <Button
                  type="button"
                  variant="outline"
                  className={styles.mediaDropzoneButton}
                  onClick={() => {
                    const value = newPhotoUrl.trim();

                    if (!value) {
                      return;
                    }

                    addPhoto(value);
                    setNewPhotoUrl("");
                  }}
                >
                  Adicionar links
                </Button>
              </div>
              <span className={styles.mediaDropzoneHint}>
                Você pode colar várias URLs separadas por linha, vírgula ou ponto e vírgula.
              </span>
            </div>

            <div className={styles.galleryShell}>
              <div className={styles.galleryGrid}>
                {formData.photos.filter(Boolean).map((photoUrl, index) => {
                  const isCover = index === 0;
                  const isOversized = oversizedPhotosUrls.includes(photoUrl);
                  const isDragging = draggedPhotoIndex === index;
                  const isDragOver = dragOverIndex === index;
                  
                  return (
                    <div
                      key={`${photoUrl}-${index}`}
                      draggable
                      onDragStart={() => setDraggedPhotoIndex(index)}
                      onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index); }}
                      onDragLeave={() => setDragOverIndex(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedPhotoIndex === null || draggedPhotoIndex === index) {
                          setDragOverIndex(null);
                          return;
                        }
                        setFormData((prev) => {
                          const newPhotos = [...prev.photos];
                          const temp = newPhotos[draggedPhotoIndex];
                          newPhotos[draggedPhotoIndex] = newPhotos[index];
                          newPhotos[index] = temp;
                          return { ...prev, photos: newPhotos };
                        });
                        setDraggedPhotoIndex(null);
                        setDragOverIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedPhotoIndex(null);
                        setDragOverIndex(null);
                      }}
                      className={`${styles.thumbnailCard} ${isCover ? styles.thumbnailCardCover : ""} ${isDragging ? styles.thumbnailCardDragging : ""} ${isDragOver ? styles.thumbnailCardDragOver : ""}`}
                    >
                      <img
                        src={photoUrl || undefined}
                        alt={`Mídia ${index + 1} do imóvel`}
                      />

                      {isOversized && (
                        <div className={styles.oversizedBadge} title="Foto acima de 7MB - Não será enviada ao Canal Pro">
                          ! &gt; 7MB (Não sincroniza)
                        </div>
                      )}

                      <button
                        type="button"
                        className={`${styles.coverStarButton} ${isCover ? styles.coverStarButtonActive : styles.coverStarButtonInactive}`}
                        onClick={() => {
                          if (index !== 0) {
                            setFormData((prev) => {
                              const newPhotos = [...prev.photos];
                              const temp = newPhotos[index];
                              newPhotos[index] = newPhotos[0];
                              newPhotos[0] = temp;
                              return { ...prev, photos: newPhotos };
                            });
                          }
                        }}
                        aria-label={isCover ? "Capa atual" : "Definir como capa"}
                        title="Definir como capa"
                      >
                        <Star size={14} fill={isCover ? "currentColor" : "none"} />
                      </button>

                      {isCover ? (
                        <span className={styles.coverBadge}>Capa</span>
                      ) : null}

                      <button
                        type="button"
                        className={styles.removePhotoButton}
                        onClick={() => {
                           setFormData(prev => {
                             const newPhotos = [...prev.photos];
                             newPhotos.splice(index, 1);
                             return { ...prev, photos: newPhotos };
                           });
                        }}
                        aria-label={`Remover mídia ${index + 1}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.videoSection} style={{ marginTop: '2rem' }}>
              <div className={styles.mediaDropzoneText} style={{ marginBottom: '1rem', textAlign: 'left' }}>
                <strong>Adicione Vídeos do YouTube</strong>
                <span style={{ display: 'block', fontSize: '0.85rem' }}>Cole os links do YouTube (ex: youtube.com/watch?v=...) para exibir no carrossel de mídia.</span>
              </div>
              
              <div className={styles.mediaDropzoneActions}>
                <Input
                  label="URL do YouTube"
                  icon={PlaySquare}
                  placeholder="Cole a URL do vídeo"
                  value={newVideoUrl}
                  onChange={(event) => setNewVideoUrl(event.target.value)}
                  className={styles.mediaDropzoneInput}
                />
                <Button
                  type="button"
                  variant="outline"
                  className={styles.mediaDropzoneButton}
                  onClick={() => {
                    addVideo(newVideoUrl);
                    setNewVideoUrl("");
                  }}
                >
                  Adicionar Vídeo
                </Button>
              </div>

              {formData.videos.length > 0 && (
                <div className={styles.galleryShell} style={{ marginTop: '1.5rem', background: 'rgba(20, 20, 60, 0.03)', padding: '1rem', borderRadius: '1rem' }}>
                  <div className={styles.galleryGrid}>
                    {formData.videos.filter(Boolean).map((videoUrl, index) => (
                      <div key={`video-${index}`} className={styles.thumbnailCard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: '#fff', border: '1px solid rgba(20,20,60,0.1)' }}>
                        <span style={{ fontSize: '0.8rem', wordBreak: 'break-all', textAlign: 'center' }}>{videoUrl}</span>
                        <button
                          type="button"
                          className={styles.removePhotoButton}
                          onClick={() => removeVideo(index)}
                          aria-label={`Remover vídeo ${index + 1}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : null}

        {activeTab === "description" ? (
          <section className={styles.tabPanel}>
            <div className={styles.descriptionGroup} style={{ paddingBottom: '2rem' }}>
              <div className={styles.textareaField}>
                <div className={styles.descriptionHeader}>
                  <span className={styles.textareaLabel}>Descrição Completa</span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleGenerateDescription}
                    className={styles.generateDescBtn}
                  >
                    <Wand2 size={14} style={{ marginRight: '6px' }} />
                    Gerar Descrição Automática
                  </Button>
                </div>
                <div className={`${styles.quillContainer} ${(formData.description || '').length > 3000 ? styles.quillWarning : (formData.description || '').length >= 2900 ? styles.quillWarning : ''}`}>
                  <ReactQuill
                    theme="snow"
                    value={formData.description}
                    onChange={(content) => setFormData((prev) => ({ ...prev, description: content }))}
                    modules={quillModules}
                    maxLength={3000}
                    placeholder="Descreva o imóvel com detalhes, diferenciais, posicionamento solar, acabamentos e contexto de uso."
                  />
                </div>
                <div className={styles.charCounterWrap}>
                  <span className={`${styles.charCounter} ${(formData.description || '').length > 3000 ? styles.charCounterWarning : ''}`}>
                    {(formData.description || '').length} / 3000
                  </span>
                </div>
                
                {(formData.description || '').length > 3000 && (
                  <div className={styles.descriptionWarningAlert}>
                    <strong>Atenção:</strong> A descrição ultrapassa 3000 caracteres. Este imóvel ficará visível no seu site, mas não será sincronizado com o Canal Pro.
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}
          </div>

          <aside className={styles.scoreSidebar}>
            <div className={styles.scoreContainer}>
              <div className={styles.scoreHeader}>
                <div className={styles.scoreTitle}>
                  <Star size={16} fill={scoreData.color} color={scoreData.color} />
                  Nota do Anúncio
                </div>
                <div className={styles.scoreValue} style={{ color: scoreData.color }}>
                  {scoreData.score} / 100
                </div>
              </div>
              <div className={styles.scoreProgressBg}>
                <div 
                  className={styles.scoreProgressBar} 
                  style={{ width: `${scoreData.score}%`, backgroundColor: scoreData.color }}
                />
              </div>
              <div className={styles.scoreTipsWrapper}>
                <button 
                  type="button" 
                  className={styles.scoreTipsToggle}
                  onClick={() => setShowTips(!showTips)}
                >
                  {showTips ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {showTips ? "Ocultar dicas" : "Ver dicas para melhorar a nota"}
                </button>
                {showTips && (
                  <div className={styles.scoreTips}>
                    {scoreData.tips.map(tip => (
                      <div key={tip.id} className={`${styles.scoreTipItem} ${tip.completed ? styles.completed : ""}`}>
                        <div className={styles.scoreTipIcon}>
                          {tip.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                        </div>
                        <span>{tip.tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        <footer className={styles.modalFooter}>
          {showCancelConfirm ? (
            <div className={styles.cancelConfirm}>
              <p className={styles.cancelConfirmText}>
                Descartar as alterações feitas?
              </p>
              <div className={styles.cancelConfirmActions}>
                <Button
                  variant="outline"
                  className={styles.modalButton}
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Continuar editando
                </Button>
                <Button
                  variant="secondary"
                  className={styles.modalButton}
                  onClick={handleConfirmCancel}
                >
                  Sim, descartar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className={styles.modalButton}
                onClick={handleCancelClick}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                className={styles.modalButton}
                disabled={isSaving || !!codeError}
              >
                {isSaving ? <Loader size={20} /> : <Save size={16} />}
                <span>{isSaving ? "Salvando..." : "Salvar Imóvel"}</span>
              </Button>
            </>
          )}
        </footer>
      </form>
    </Modal>
  );
}
