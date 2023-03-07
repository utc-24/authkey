import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

// import BadgeDangerZone from "@components/Badge/BadgeDangerZone";

import { 
    useUser, 
    useBadgeForm,
    useIPFS,
    useIPFSImageHash,
    useIPFSMetadataHash
} from "@hooks";

import { 
    FormActionBar, 
    FormDrawer,
    initialBadgeForm, 
    Input, 
    Header, 
    ImageLoader 
} from "@components";

import { getBadgeImage } from "@utils";

import { IPFS_GATEWAY_URL } from "@static";

import "@style/pages/BadgeForm.css";

const BadgeForm = ({ isEdit = false }) => {
    const imageInput = useRef();
    
    const navigate = useNavigate();

    const { chainId, orgAddress } = useParams();

    const { organization, badge } = useUser({ chainId, orgAddress });

    const [ obj, setObj ] = useState(badge || initialBadgeForm);
    const [ image, setImage ] = useState(null);
    const [ generatedImage, setGeneratedImage ] = useState(null);

    const customImage = image || obj.image_hash;

    /// Prioritizes an uploaded image, then the ipfs gateway image, then the generated image
    const activeImageURL = customImage ? 
        (image ? image : IPFS_GATEWAY_URL + obj.image_hash) :
        (generatedImage ? generatedImage : null);

    const isDisabled = !(obj.name && obj.description && activeImageURL);

    const { imageHash, ipfsImage } = useIPFSImageHash(customImage);

    const { metadataHash, ipfsMetadata } = useIPFSMetadataHash({
        name: obj.name,
        description: obj.description,
        image: imageHash,
        attributes: obj.attributes
    })

    const transactionParams = {
        ...obj,
        imageHash: imageHash,
        uriHash: metadataHash,
        token_id: obj.token_id || organization.badges.length
    }
    
    const { 
        openBadgeFormTransaction, 
        isPrepared, 
        isLoading 
    } = useBadgeForm({ obj: transactionParams, functionName: "setBadgeURI" });

    const { pinImage, pinMetadata } = useIPFS({
        image: ipfsImage,
        data: ipfsMetadata
    })

    const actions = [{
        text: isEdit ? "Update badge" : "Create badge",
        icon: ["fal", "arrow-right"],
        disabled: isDisabled || !isPrepared,
        loading: isLoading,
        event: () => openBadgeFormTransaction({
            onSuccess: ({ badge }) => { navigate(`/organization/${orgAddress}/badge/${badge.token_id}/`) }
        })
    }]
    
    // Updates generative image and Name field
    const onNameChange = async (event) => {
        setObj({...obj, name: event.target.value });

        // Prevent generating image if custom image is uploaded
        if (!customImage) {
            const response = await getBadgeImage(
                organization?.name,
                organization?.ethereum_address,
                organization?.badges?.length,
                event.target.value
            );
            
            onCustomImageChange(response);
        }
    }

    const onDescriptionChange = (event) => {
        setObj({...obj, description: event.target.value });
    }

    const onCustomImageChange = (file, uploaded) => {
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => {
            uploaded ? setImage(reader.result) : setGeneratedImage(reader.result);
        }
    }

    return (
        <>
            <Header back={() => navigate(`/dashboard/organization/${chainId}/${orgAddress}`)} />

            <h2>
                {isEdit ? "Update Badge" : "Create Badge"}
            </h2>

            <FormDrawer label="General" open={true}>
                <div className="badge__form__general">
                    <div>
                        <Input
                            name="badge-name"
                            label="Name"
                            placeholder="Name"
                            required={true}
                            value={obj.name}
                            onChange={onNameChange}
                        />

                        <Input
                            name="badge-description"
                            label="Description"
                            placeholder="Description"
                            required={true}
                            value={obj.description}
                            onChange={onDescriptionChange}
                        />
                    </div>
                    <div className="form__group" style={{ gridTemplateRows: "min-content" }}>
                        <label className="form__label">Live Badge Preview</label>
                        <div className="preview__container">
                            <ImageLoader
                                className="preview__image"
                                src={activeImageURL}
                                alt="Badge Preview"
                            />
                        </div>
                    </div>
                </div>
            </FormDrawer>

            <FormDrawer label="Appearance" open={false}>
                <Input
                    name="Custom Image"
                    accept="image/*"
                    label="Custom Image"
                    required={false}
                    disabled={true}
                    value={imageInput.current?.files[0]?.name ?? "Upload Custom Image"}
                    append={
                        <button className="secondary"
                            onClick={() => imageInput.current.click()}
                            style={{ width: "auto" }}
                        >
                            {customImage ?
                                "Change image" :
                                "Upload image"
                            }
                        </button>
                    }
                />
                <input
                    id="badge-image"
                    style={{ display: "none" }}
                    ref={imageInput}
                    accept="image/*"
                    type="file"
                    onChange={(e) => onCustomImageChange(e.target.files[0], true)}
                />
            </FormDrawer>

            <FormActionBar
                help={'After creating a badge, you (or your managers) can issue badges to team members.'}
                actions={actions}
            />
        </>
    )
}

export { BadgeForm };