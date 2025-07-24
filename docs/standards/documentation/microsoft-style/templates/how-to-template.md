# [Action verb] [specific task]

This article explains how to [task]. Use this approach when you want to [scenario].

**In this article**

- [Prerequisites](#prerequisites)
- [Main task](#main-task)
- [Verify results](#verify-results)
- [Clean up resources](#clean-up-resources)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- [Specific requirement with version]
- [Permission or access needed]
- Complete [prerequisite task](link) if you haven't already

## [Main task]

Choose the method that works best for your scenario:

### Use the [interface name]

The easiest way to [task] is through the [interface].

1. Go to the [location] in the [interface].

2. Find your [resource] in the list.

   > [!NOTE]
   > If you don't see your [resource], make sure you selected the correct [filter/scope].

3. Select **[Action]** > **[Specific option]**.

4. Configure these settings:

   | Setting  | Value         | Description                          |
   | -------- | ------------- | ------------------------------------ |
   | **Name** | *Your choice* | A descriptive name for [purpose]     |
   | **Type** | *Standard*    | For most scenarios, use Standard     |
   | **Size** | *Medium*      | Balance between performance and cost |

5. Select **Review + create**.

6. Review your settings, then select **Create**.

The operation typically completes in 2-5 minutes. You can monitor progress in the notifications area.

### Use the command line

If you prefer working from the command line, or need to automate this task:

```bash
# Set your variables
RESOURCE_NAME="your-resource-name"
LOCATION="eastus"

# Create the resource
az resource create \
  --name $RESOURCE_NAME \
  --location $LOCATION \
  --type Standard \
  --size Medium
```

> [!IMPORTANT]
> Replace the example values with your actual values. The location must be a valid Azure region.

### Use PowerShell

For Windows users or those who prefer PowerShell:

```powershell
# Set your variables
$resourceName = "your-resource-name"
$location = "eastus"

# Create the resource
New-AzResource `
  -Name $resourceName `
  -Location $location `
  -Type Standard `
  -Size Medium
```

## Verify results

Make sure your [task] completed successfully:

1. Go to the [location] to view your new [resource].

2. Check that the status shows as **Ready** or **Active**.

3. Test the [resource] by [specific test action].

If something doesn't look right, see [Troubleshooting](#troubleshooting).

## Clean up resources

To avoid unnecessary charges, remove resources you no longer need:

> [!WARNING]
> This permanently deletes your [resource] and all associated data.

1. Select your [resource].
2. Select **Delete**.
3. Type the resource name to confirm.
4. Select **Delete**.

## Troubleshooting

### [Resource] not appearing

**Symptoms**: After creating the resource, it doesn't appear in the list.

**Possible causes**:

- The operation is still in progress
- You're looking in the wrong location
- You don't have permission to view the resource

**Solutions**:

1. Wait 2-3 minutes and refresh the page.
2. Check that you're in the correct subscription and region.
3. Verify your permissions by going to **Access control (IAM)**.

### Creation fails with error "[specific error]"

**Symptoms**: The resource creation fails with error message "[specific error message]".

**Cause**: This usually means [explanation].

**Solution**:

1. [Solution step 1]
2. [Solution step 2]
3. If the problem persists, [additional action]

### Performance issues

**Symptoms**: The [resource] is running slowly or timing out.

**Possible causes**:

- Insufficient resources allocated
- Network connectivity issues
- Configuration problems

**Solutions**:

1. Check the resource metrics in the monitoring dashboard.
2. Consider scaling up to a larger size.
3. Review the configuration settings for optimization opportunities.

## Next steps

- [Learn about advanced features](link)
- [Configure security settings](link)
- [Set up monitoring and alerts](link)
- [Integrate with other services](link)
