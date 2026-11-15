import React , {useState} from "react";
import { useForm } from "react-hook-form";

import { createLogEntry } from "./routes";

const LogEntryForm = ({location, onClose}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register, handleSubmit } = useForm();

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            data.latitude = location.latitude;
            data.longitude = location.longitude;
            if (location.id) {
                data.placeId = location.id;
                data.placeName = location.placeName;
                data.state = location.state;
            }
            const created = await createLogEntry(data);
            console.log(created);
            onClose();
        } catch (error) {
            console.log(error);
            setError(error.message);
            setLoading(false);
        }
    };

    return(
        <form onSubmit={handleSubmit(onSubmit)} className="entry-form">
            { error ? <h3 className="error">{error}</h3> : null}
            <label htmlFor="title">Title</label>
            <input id="title" {...register("title", { required: true })} />

            <label htmlFor="desc">Description</label>
            <input id="desc" {...register("description")} />

            <label htmlFor="comments">Comments</label>
            <textarea id="comments" rows={3} {...register("comments")}></textarea>

            <label htmlFor="rating">Rating</label>
            <input id="rating" type="number" placeholder="1-10" {...register("ratingdescription")} />

            <label htmlFor="img">Image</label>
            <input id="img" {...register("image")} />

            <label htmlFor="visitDate">Visit Date</label>
            <input id="visitDate" type="date" {...register("visitDate", { required: true })} />
            
            <button disabled={loading}>{loading ? 'Loading...' : 'Create Entry'}</button>
        </form>
        
    )
}

export default LogEntryForm