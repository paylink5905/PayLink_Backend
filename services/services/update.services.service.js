const AppError = require("../../custom_classes/AppError.custom_class");
const { Service } = require("../../models");

const updateServiceService = async ({
    serviceId,
    data,
    userId,
}) => {
    const allowedFields = [
        'name',
        'description',
        'amount',
        'email',
        'phone',
        'type',
        'tenure_months',
        'status'
    ];

    const updateData = {};

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updateData[field] = data[field];
        }
    }

    if (updateData.type === 'ONE_TIME') {
        updateData.tenure_months = null;
    }

    const service = await Service.findOne({
        where: {
            id: serviceId,
            user_id: userId
        }
    });

    if (!service) {
        throw new AppError('Service not found', 404);
    }

    await service.update(updateData);

    return service;
};

module.exports = updateServiceService;
