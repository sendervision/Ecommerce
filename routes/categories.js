import express from 'express';

import { CATEGORIES } from'../models/category.js';

export const categoriesRoute = express();

categoriesRoute.get('/', async (req, res) => {
    const categoryList = await CATEGORIES.find();

    if (!categoryList) {
        res.status(500).json({ success: false})
    }
    res.status(200).send(categoryList)
})

categoriesRoute.get('/:id', async (req, res) => {
    const category = await CATEGORIES.findById(req.params.id);

    if (!category) {
        res.status(500).json({ success: false, message: 'The category with the given ID not exists'})
    }
    res.status(200).send(category)
})

categoriesRoute.post('/', async (req, res) => {
    let category = new CATEGORIES({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })

    category = await category.save();

    if(!category)
    return res.status(404).send('Category cannot be created')
    res.send(category);
})

categoriesRoute.put('/:id',  async (req, res) => {
    const category = await CATEGORIES.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    }, { 
        new: true 
    })

    if (!category)
        return res.status(404).send('Category cannot be created')
    res.send(category);
})

categoriesRoute.delete('/:id', (req, res)=>{
    CATEGORIES.findByIdAndRemove(req.params.id).then(category => {
        if(category){
            return res.status(200).json({ success: true, message: 'Category deleted successfully'})
        } else {
            return res.status(404).json({ success: false, message: 'Category cannot find'})
        }
    }).catch (err=>{
        return res.status(400).json({ success: false, error: err})
    })
})
