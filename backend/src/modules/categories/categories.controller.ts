@Patch(':id/config')
@Roles('SUPER_ADMIN')
updateConfig(
  @Param('id') categoryId: string,
  @Body('cooldownRules') cooldownRules: Record<string, any>,
) {
  return this.categoriesService.updateConfig(
    categoryId,
    cooldownRules,
  );
}